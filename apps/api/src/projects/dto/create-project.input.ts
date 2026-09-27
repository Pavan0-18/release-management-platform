import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultChecklistItemInput } from './default-checklist-item.input';

@InputType({ description: 'Input payload for creating a new project' })
export class CreateProjectInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(2, { message: 'Project name must be at least 2 characters' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  name!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Project key is required' })
  @MinLength(2, { message: 'Project key must be at least 2 characters' })
  @MaxLength(20, { message: 'Project key must not exceed 20 characters' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'Project key must contain only letters, numbers, hyphens or underscores',
  })
  key!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @Field(() => [DefaultChecklistItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultChecklistItemInput)
  defaultChecklist?: DefaultChecklistItemInput[];
}
