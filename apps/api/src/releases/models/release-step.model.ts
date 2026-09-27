import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { StepStatus } from '../enums/release-status.enum';

@ObjectType({ description: 'A single verification step or checklist item for a release' })
export class ReleaseStepModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  releaseId!: string;

  @Field(() => String, { description: 'Short title or requirement for the step' })
  title!: string;

  @Field(() => String, { nullable: true, description: 'Detailed instruction or description' })
  description?: string | null;

  @Field(() => StepStatus, { description: 'Current completion status of the step' })
  status!: StepStatus;

  @Field(() => Int, { description: 'Execution order index' })
  order!: number;

  @Field(() => Boolean, { description: 'Whether this step is mandatory for release completion' })
  isRequired!: boolean;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
