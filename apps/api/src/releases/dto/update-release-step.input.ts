import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { StepStatus } from '../enums/release-status.enum';

@InputType({ description: 'Input payload for modifying a release verification step' })
export class UpdateReleaseStepInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => StepStatus, { nullable: true })
  @IsEnum(StepStatus)
  @IsOptional()
  status?: StepStatus;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  order?: number;
}
