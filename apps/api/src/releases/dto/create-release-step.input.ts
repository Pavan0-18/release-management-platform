import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType({ description: 'Input payload for adding a verification step to an existing release' })
export class CreateReleaseStepInput {
  @Field(() => String, { description: 'ID of the parent release' })
  @IsString()
  @IsNotEmpty()
  releaseId!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  order?: number;
}
