import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesService } from './releases.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ReleaseStatus, StepStatus } from './enums/release-status.enum';

describe('ReleasesService', () => {
  let service: ReleasesService;
  let prisma: PrismaService;

  const mockProject = {
    id: 'proj-123',
    name: 'Core Platform',
    key: 'CORE',
    description: 'Core backend services',
    defaultChecklist: [{ title: 'Verify staging deployment', isRequired: true }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRelease = {
    id: 'rel-123',
    projectId: 'proj-123',
    project: mockProject,
    name: 'Q3 Major Release',
    version: 'v1.0.0',
    description: 'Initial production launch',
    status: ReleaseStatus.IN_PROGRESS,
    targetDate: new Date('2026-10-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'step-1',
        releaseId: 'rel-123',
        title: 'Run database migrations',
        description: null,
        status: StepStatus.COMPLETED,
        order: 0,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'step-2',
        releaseId: 'rel-123',
        title: 'Verify smoke tests',
        description: null,
        status: StepStatus.PENDING,
        order: 1,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  const mockPrismaService = {
    project: {
      findUnique: jest.fn().mockResolvedValue(mockProject),
    },
    release: {
      findMany: jest.fn().mockResolvedValue([mockRelease]),
      findUnique: jest.fn().mockResolvedValue(mockRelease),
      create: jest.fn().mockResolvedValue(mockRelease),
      update: jest.fn().mockResolvedValue(mockRelease),
      delete: jest.fn().mockResolvedValue(mockRelease),
    },
    releaseStep: {
      findUnique: jest.fn().mockResolvedValue(mockRelease.steps[0]),
      create: jest.fn().mockResolvedValue(mockRelease.steps[0]),
      update: jest.fn().mockResolvedValue(mockRelease.steps[0]),
      delete: jest.fn().mockResolvedValue(mockRelease.steps[0]),
      count: jest.fn().mockResolvedValue(2),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return releases with computed progress metrics', async () => {
      const results = await service.findAll();
      expect(results).toHaveLength(1);
      expect(results[0].totalSteps).toBe(2);
      expect(results[0].completedSteps).toBe(1);
      expect(results[0].progressPercentage).toBe(50);
    });
  });

  describe('findOne', () => {
    it('should return a release by ID', async () => {
      const result = await service.findOne('rel-123');
      expect(result.id).toBe('rel-123');
      expect(result.name).toBe('Q3 Major Release');
    });

    it('should throw NotFoundException if release does not exist', async () => {
      jest.spyOn(prisma.release, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new release with steps', async () => {
      jest.spyOn(prisma.release, 'findUnique').mockResolvedValueOnce(null); // uniqueness check
      const result = await service.create({
        projectId: 'proj-123',
        name: 'New Release',
        version: 'v1.1.0',
        steps: [{ title: 'Verify staging' }],
      });
      expect(result).toBeDefined();
      expect(prisma.release.create).toHaveBeenCalled();
    });
  });

  describe('addStep', () => {
    it('should add a verification step to an existing release', async () => {
      const result = await service.addStep({
        releaseId: 'rel-123',
        title: 'Run performance benchmarks',
      });
      expect(result).toBeDefined();
      expect(prisma.releaseStep.create).toHaveBeenCalled();
    });
  });
});
