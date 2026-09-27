import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HealthStatus } from './models/health.model';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getHealth(): string {
    return 'OK';
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const isDbHealthy = await this.prisma.isHealthy();

    return {
      status: isDbHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDbHealthy ? 'CONNECTED' : 'DISCONNECTED',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    };
  }

  async isDatabaseHealthy(): Promise<boolean> {
    return this.prisma.isHealthy();
  }
}
