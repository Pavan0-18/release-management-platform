import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType({ description: 'Inline step definition when creating a release' })
export class CreateStepInlineInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  isRequired?: boolean;
}

@InputType({ description: 'Input payload for creating a new release' })
export class CreateReleaseInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[vV]?[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9.]+)?$/, {
    message: 'Version must follow semantic versioning (e.g., v1.0.0, 1.2.0, v2.0.0-rc.1)',
  })
  version!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  targetDate?: Date;

  @Field(() => [CreateStepInlineInput], {
    nullable: true,
    description: 'Optional initial checklist items',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStepInlineInput)
  steps?: CreateStepInlineInput[];
}
