import { Field, ID, Float, Int, ObjectType } from '@nestjs/graphql';
import { ReleaseStatus } from '../enums/release-status.enum';
import { ReleaseStepModel } from './release-step.model';

@ObjectType({ description: 'A governed software release with checklist steps' })
export class ReleaseModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: 'Name of the release' })
  name!: string;

  @Field(() => String, { description: 'Semantic version or release identifier (e.g., v1.2.0)' })
  version!: string;

  @Field(() => String, { nullable: true, description: 'Summary notes or scope of this release' })
  description?: string | null;

  @Field(() => ReleaseStatus, { description: 'Current lifecycle state' })
  status!: ReleaseStatus;

  @Field(() => Date, { nullable: true, description: 'Planned target deployment date' })
  targetDate?: Date | null;

  @Field(() => [ReleaseStepModel], { description: 'Checklist verification steps for this release' })
  steps!: ReleaseStepModel[];

  @Field(() => Int, { description: 'Total number of verification steps' })
  totalSteps?: number;

  @Field(() => Int, { description: 'Number of successfully completed steps' })
  completedSteps?: number;

  @Field(() => Float, { description: 'Calculated completion progress percentage (0 - 100)' })
  progressPercentage?: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
