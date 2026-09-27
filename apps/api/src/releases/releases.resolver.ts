import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReleasesService } from './releases.service';
import { ReleaseModel } from './models/release.model';
import { ReleaseStepModel } from './models/release-step.model';
import { CreateReleaseInput } from './dto/create-release.input';
import { UpdateReleaseInput } from './dto/update-release.input';
import { CreateReleaseStepInput } from './dto/create-release-step.input';
import { UpdateReleaseStepInput } from './dto/update-release-step.input';
import { FilterReleasesInput } from './dto/filter-releases.input';

@Resolver(() => ReleaseModel)
export class ReleasesResolver {
  constructor(private readonly releasesService: ReleasesService) {}

  @Query(() => [ReleaseModel], {
    name: 'releases',
    description: 'Retrieve all releases with optional filtering by status or search terms',
  })
  async getReleases(
    @Args('filter', { nullable: true }) filter?: FilterReleasesInput,
  ): Promise<ReleaseModel[]> {
    return this.releasesService.findAll(filter);
  }

  @Query(() => ReleaseModel, {
    name: 'release',
    description: 'Retrieve a single release by its unique ID',
  })
  async getRelease(@Args('id', { type: () => ID }) id: string): Promise<ReleaseModel> {
    return this.releasesService.findOne(id);
  }

  @Mutation(() => ReleaseModel, {
    name: 'createRelease',
    description: 'Create a new release and optionally define initial checklist steps',
  })
  async createRelease(@Args('input') input: CreateReleaseInput): Promise<ReleaseModel> {
    return this.releasesService.create(input);
  }

  @Mutation(() => ReleaseModel, {
    name: 'updateRelease',
    description: 'Update release properties such as version, status, and target date',
  })
  async updateRelease(@Args('input') input: UpdateReleaseInput): Promise<ReleaseModel> {
    return this.releasesService.update(input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteRelease',
    description: 'Delete a release and its associated checklist steps',
  })
  async deleteRelease(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.releasesService.delete(id);
  }

  @Mutation(() => ReleaseStepModel, {
    name: 'addReleaseStep',
    description: 'Add a new checklist step to an existing release',
  })
  async addReleaseStep(@Args('input') input: CreateReleaseStepInput): Promise<ReleaseStepModel> {
    return this.releasesService.addStep(input);
  }

  @Mutation(() => ReleaseStepModel, {
    name: 'updateReleaseStep',
    description: 'Update an existing release checklist step',
  })
  async updateReleaseStep(@Args('input') input: UpdateReleaseStepInput): Promise<ReleaseStepModel> {
    return this.releasesService.updateStep(input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteReleaseStep',
    description: 'Remove a verification step from a release checklist',
  })
  async deleteReleaseStep(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.releasesService.deleteStep(id);
  }
}
