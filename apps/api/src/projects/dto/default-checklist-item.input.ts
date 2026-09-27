import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType({ description: 'Default checklist step definition for project template' })
export class DefaultChecklistItemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isRequired: boolean = true;
}
