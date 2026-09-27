import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReleaseInput } from './dto/create-release.input';
import { UpdateReleaseInput } from './dto/update-release.input';
import { CreateReleaseStepInput } from './dto/create-release-step.input';
import { UpdateReleaseStepInput } from './dto/update-release-step.input';
import { FilterReleasesInput } from './dto/filter-releases.input';
import { ReleaseModel } from './models/release.model';
import { ReleaseStepModel } from './models/release-step.model';
import { StepStatus } from './enums/release-status.enum';

@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapReleaseMetrics(release: any): ReleaseModel {
    const steps: ReleaseStepModel[] = (release.steps || []).map((s: any) => ({
      ...s,
    }));

    const totalSteps = steps.length;
    const completedSteps = steps.filter(
      (s) => s.status === StepStatus.COMPLETED || s.status === StepStatus.SKIPPED,
    ).length;
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      ...release,
      project: release.project
        ? {
            ...release.project,
            defaultChecklist: (release.project.defaultChecklist as any) || [],
            totalReleases: release.project._count?.releases ?? 0,
          }
        : undefined,
      steps,
      totalSteps,
      completedSteps,
      progressPercentage: Math.round(progressPercentage * 10) / 10,
    };
  }

  async findAll(filter?: FilterReleasesInput): Promise<ReleaseModel[]> {
    const where: any = {};

    if (filter?.projectId) {
      where.projectId = filter.projectId;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { version: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const releases = await this.prisma.release.findMany({
      where,
      include: {
        project: true,
        steps: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return releases.map((r) => this.mapReleaseMetrics(r));
  }

  async findOne(id: string): Promise<ReleaseModel> {
    const release = await this.prisma.release.findUnique({
      where: { id },
      include: {
        project: true,
        steps: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!release) {
      throw new NotFoundException(`Release with ID "${id}" not found`);
    }

    return this.mapReleaseMetrics(release);
  }

  async create(input: CreateReleaseInput): Promise<ReleaseModel> {
    const { projectId, name, version, description, targetDate, steps } = input;

    // Verify parent project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    // Check version uniqueness within this project
    const existingRelease = await this.prisma.release.findUnique({
      where: {
        projectId_version: {
          projectId,
          version: version.trim(),
        },
      },
    });

    if (existingRelease) {
      throw new ConflictException(
        `A release with version "${version}" already exists in project "${project.name}"`,
      );
    }

    // If no steps are explicitly provided, auto-populate from Project's default checklist
    let stepsToCreate: {
      title: string;
      description?: string;
      isRequired: boolean;
      order: number;
    }[] = [];

    if (steps && steps.length > 0) {
      stepsToCreate = steps.map((step, idx) => ({
        title: step.title.trim(),
        description: step.description?.trim(),
        isRequired: step.isRequired !== undefined ? step.isRequired : true,
        order: idx,
      }));
    } else if (project.defaultChecklist && Array.isArray(project.defaultChecklist)) {
      const defaultItems = project.defaultChecklist as Array<{
        title: string;
        description?: string;
        isRequired?: boolean;
      }>;
      stepsToCreate = defaultItems.map((item, idx) => ({
        title: item.title,
        description: item.description,
        isRequired: item.isRequired !== undefined ? item.isRequired : true,
        order: idx,
      }));
    }

    const release = await this.prisma.release.create({
      data: {
        projectId,
        name: name.trim(),
        version: version.trim(),
        description: description?.trim() || null,
        targetDate,
        steps: {
          create: stepsToCreate,
        },
      },
      include: {
        project: true,
        steps: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    this.logger.log(
      `Created release "${release.name}" (${release.version}) in project "${project.name}" with ${stepsToCreate.length} steps`,
    );
    return this.mapReleaseMetrics(release);
  }

  async update(input: UpdateReleaseInput): Promise<ReleaseModel> {
    const { id, ...data } = input;

    // Verify existence
    await this.findOne(id);

    const updated = await this.prisma.release.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        version: data.version !== undefined ? data.version.trim() : undefined,
        description: data.description !== undefined ? data.description?.trim() || null : undefined,
        status: data.status,
        targetDate: data.targetDate,
      },
      include: {
        project: true,
        steps: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    this.logger.log(`Updated release "${updated.id}"`);
    return this.mapReleaseMetrics(updated);
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);

    await this.prisma.release.delete({
      where: { id },
    });

    this.logger.log(`Deleted release "${id}"`);
    return true;
  }

  async addStep(input: CreateReleaseStepInput): Promise<ReleaseStepModel> {
    const { releaseId, title, description, isRequired, order } = input;

    // Verify release exists
    await this.findOne(releaseId);

    // If order not explicitly provided, put it at the end
    let stepOrder = order;
    if (stepOrder === undefined) {
      const stepCount = await this.prisma.releaseStep.count({
        where: { releaseId },
      });
      stepOrder = stepCount;
    }

    const step = await this.prisma.releaseStep.create({
      data: {
        releaseId,
        title: title.trim(),
        description: description?.trim() || null,
        isRequired: isRequired !== undefined ? isRequired : true,
        order: stepOrder,
      },
    });

    this.logger.log(`Added step "${step.title}" to release "${releaseId}"`);
    return step;
  }

  async updateStep(input: UpdateReleaseStepInput): Promise<ReleaseStepModel> {
    const { id, ...data } = input;

    const existing = await this.prisma.releaseStep.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Release step with ID "${id}" not found`);
    }

    const updated = await this.prisma.releaseStep.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description?.trim() || null : undefined,
        status: data.status,
        isRequired: data.isRequired,
        order: data.order,
      },
    });

    this.logger.log(`Updated release step "${id}"`);
    return updated;
  }

  async deleteStep(id: string): Promise<boolean> {
    const existing = await this.prisma.releaseStep.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Release step with ID "${id}" not found`);
    }

    await this.prisma.releaseStep.delete({
      where: { id },
    });

    this.logger.log(`Deleted release step "${id}"`);
    return true;
  }
}
