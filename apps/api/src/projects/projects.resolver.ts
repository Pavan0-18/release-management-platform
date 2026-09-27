import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { ProjectModel } from './models/project.model';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';

@Resolver(() => ProjectModel)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [ProjectModel], {
    name: 'projects',
    description: 'Retrieve all projects with release metrics and checklist configurations',
  })
  async getProjects(): Promise<ProjectModel[]> {
    return this.projectsService.findAll();
  }

  @Query(() => ProjectModel, {
    name: 'project',
    description: 'Retrieve a single project by its unique ID',
  })
  async getProject(@Args('id', { type: () => ID }) id: string): Promise<ProjectModel> {
    return this.projectsService.findOne(id);
  }

  @Query(() => ProjectModel, {
    name: 'projectByKey',
    description: 'Retrieve a single project by its unique key/slug',
  })
  async getProjectByKey(@Args('key') key: string): Promise<ProjectModel> {
    return this.projectsService.findByKey(key);
  }

  @Mutation(() => ProjectModel, {
    name: 'createProject',
    description: 'Create a new project and define default release checklist template',
  })
  async createProject(@Args('input') input: CreateProjectInput): Promise<ProjectModel> {
    return this.projectsService.create(input);
  }

  @Mutation(() => ProjectModel, {
    name: 'updateProject',
    description: 'Update project metadata and default checklist template',
  })
  async updateProject(@Args('input') input: UpdateProjectInput): Promise<ProjectModel> {
    return this.projectsService.update(input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteProject',
    description: 'Delete a project and cascade delete all its associated releases',
  })
  async deleteProject(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.projectsService.delete(id);
  }
}
