import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType({
  description: 'Detailed health status of the application and underlying infrastructure',
})
export class HealthStatus {
  @Field(() => String, { description: 'Overall system status (OK or ERROR)' })
  status!: string;

  @Field(() => String, { description: 'ISO 8601 timestamp of the health check' })
  timestamp!: string;

  @Field(() => Float, { description: 'Process uptime in seconds' })
  uptime!: number;

  @Field(() => String, { description: 'Database connectivity status' })
  database!: string;

  @Field(() => String, { description: 'Current environment name' })
  environment!: string;
}
