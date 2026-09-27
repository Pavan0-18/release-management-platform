import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectNature } from '@rmp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ProjectModel } from './models/project.model';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve all projects with release counts using optimized aggregation
   */
  async findAll(): Promise<ProjectModel[]> {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { releases: true },
        },
      },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      nature: project.nature as unknown as ProjectNature,
      services: (project.services as string[]) || [],
      defaultChecklist: (project.defaultChecklist as any) || [],
      totalReleases: project._count.releases,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }

  /**
   * Retrieve single project by ID with releases and steps preloaded
   */
  async findOne(id: string): Promise<ProjectModel> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        releases: {
          orderBy: { createdAt: 'desc' },
          include: {
            steps: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: { releases: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const mappedReleases = project.releases.map((release) => {
      const totalSteps = release.steps.length;
      const completedSteps = release.steps.filter((s) => s.status === 'COMPLETED').length;
      const progressPercentage =
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      return {
        ...release,
        steps: release.steps,
        totalSteps,
        completedSteps,
        progressPercentage,
      };
    });

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      nature: project.nature as unknown as ProjectNature,
      services: (project.services as string[]) || [],
      defaultChecklist: (project.defaultChecklist as any) || [],
      releases: mappedReleases,
      totalReleases: project._count.releases,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Retrieve single project by unique Key
   */
  async findByKey(key: string): Promise<ProjectModel> {
    const normalizedKey = key.toUpperCase().trim();
    const project = await this.prisma.project.findUnique({
      where: { key: normalizedKey },
      include: {
        _count: {
          select: { releases: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with key "${normalizedKey}" not found`);
    }

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      nature: project.nature as unknown as ProjectNature,
      services: (project.services as string[]) || [],
      defaultChecklist: (project.defaultChecklist as any) || [],
      totalReleases: project._count.releases,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Create a new project with default checklist template
   */
  async create(input: CreateProjectInput): Promise<ProjectModel> {
    const normalizedKey = input.key.toUpperCase().trim();

    // Check unique key constraint
    const existing = await this.prisma.project.findUnique({
      where: { key: normalizedKey },
    });

    if (existing) {
      throw new ConflictException(`Project with key "${normalizedKey}" already exists`);
    }

    const project = await this.prisma.project.create({
      data: {
        name: input.name.trim(),
        key: normalizedKey,
        description: input.description?.trim() || null,
        nature: input.nature || 'MONOLITH',
        services: input.services ? (input.services as any) : null,
        defaultChecklist: input.defaultChecklist ? (input.defaultChecklist as any) : null,
      },
      include: {
        _count: {
          select: { releases: true },
        },
      },
    });

    this.logger.log(`Created project "${project.name}" [${project.key}] (${project.id})`);

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      nature: project.nature as unknown as ProjectNature,
      services: (project.services as string[]) || [],
      defaultChecklist: (project.defaultChecklist as any) || [],
      totalReleases: 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Update existing project
   */
  async update(input: UpdateProjectInput): Promise<ProjectModel> {
    const project = await this.prisma.project.findUnique({
      where: { id: input.id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${input.id}" not found`);
    }

    let normalizedKey: string | undefined = undefined;
    if (input.key) {
      normalizedKey = input.key.toUpperCase().trim();
      if (normalizedKey !== project.key) {
        const existingKey = await this.prisma.project.findUnique({
          where: { key: normalizedKey },
        });
        if (existingKey) {
          throw new ConflictException(`Project with key "${normalizedKey}" already exists`);
        }
      }
    }

    const updated = await this.prisma.project.update({
      where: { id: input.id },
      data: {
        name: input.name !== undefined ? input.name.trim() : undefined,
        key: normalizedKey,
        description:
          input.description !== undefined ? input.description?.trim() || null : undefined,
        nature: input.nature !== undefined ? input.nature : undefined,
        services: input.services !== undefined ? (input.services as any) : undefined,
        defaultChecklist:
          input.defaultChecklist !== undefined ? (input.defaultChecklist as any) : undefined,
      },
      include: {
        _count: {
          select: { releases: true },
        },
      },
    });

    this.logger.log(`Updated project "${updated.name}" (${updated.id})`);

    return {
      id: updated.id,
      name: updated.name,
      key: updated.key,
      description: updated.description,
      nature: updated.nature as unknown as ProjectNature,
      services: (updated.services as string[]) || [],
      defaultChecklist: (updated.defaultChecklist as any) || [],
      totalReleases: updated._count.releases,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Delete project and cascade delete all its releases and steps
   */
  async delete(id: string): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    await this.prisma.project.delete({
      where: { id },
    });

    this.logger.log(`Deleted project "${project.name}" (${id})`);
    return true;
  }
}
