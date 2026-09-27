import { Query, Resolver } from '@nestjs/graphql';
import { HealthService } from './health.service';
import { HealthStatus } from './models/health.model';

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => String, {
    name: 'health',
    description: 'Basic health check returning OK when the API is running',
  })
  health(): string {
    return this.healthService.getHealth();
  }

  @Query(() => HealthStatus, {
    name: 'healthStatus',
    description:
      'Comprehensive health check with uptime, environment, and database connectivity status',
  })
  async healthStatus(): Promise<HealthStatus> {
    return this.healthService.getHealthStatus();
  }

  @Query(() => String, {
    name: 'dbHealth',
    description: 'Check connectivity status directly against PostgreSQL database',
  })
  async dbHealth(): Promise<string> {
    const isHealthy = await this.healthService.isDatabaseHealthy();
    return isHealthy ? 'CONNECTED' : 'DISCONNECTED';
  }
}
