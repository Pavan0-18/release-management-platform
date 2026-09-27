import { Test, TestingModule } from '@nestjs/testing';
import { HealthResolver } from './health.resolver';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('HealthResolver', () => {
  let resolver: HealthResolver;
  let service: HealthService;

  beforeEach(async () => {
    const mockPrismaService = {
      isHealthy: jest.fn().mockResolvedValue(true),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthResolver,
        HealthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    resolver = module.get<HealthResolver>(HealthResolver);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('health query', () => {
    it('should return "OK"', () => {
      expect(resolver.health()).toBe('OK');
    });
  });

  describe('healthStatus query', () => {
    it('should return health status object with OK and CONNECTED', async () => {
      const result = await resolver.healthStatus();
      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('database', 'CONNECTED');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('environment', 'test');
    });
  });

  describe('dbHealth query', () => {
    it('should return "CONNECTED" when db is healthy', async () => {
      const result = await resolver.dbHealth();
      expect(result).toBe('CONNECTED');
    });
  });
});
