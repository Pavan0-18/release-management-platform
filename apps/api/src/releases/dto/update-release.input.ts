import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReleaseStatus } from '../enums/release-status.enum';

@InputType({ description: 'Input payload for modifying an existing release' })
export class UpdateReleaseInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  serviceName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  version?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ReleaseStatus, { nullable: true })
  @IsEnum(ReleaseStatus)
  @IsOptional()
  status?: ReleaseStatus;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  targetDate?: Date;
}
