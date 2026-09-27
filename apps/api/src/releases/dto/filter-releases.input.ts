import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReleaseStatus } from '../enums/release-status.enum';

@InputType({ description: 'Filter and search criteria for querying releases' })
export class FilterReleasesInput {
  @Field(() => ID, { nullable: true, description: 'Filter releases by project ID' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @Field(() => String, { nullable: true, description: 'Filter releases by microservice name' })
  @IsString()
  @IsOptional()
  serviceName?: string;

  @Field(() => ReleaseStatus, { nullable: true })
  @IsEnum(ReleaseStatus)
  @IsOptional()
  status?: ReleaseStatus;

  @Field(() => String, { nullable: true, description: 'Search term for name or version' })
  @IsString()
  @IsOptional()
  search?: string;
}
