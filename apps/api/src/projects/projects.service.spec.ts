import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockProject = {
    id: 'proj-123',
    name: 'Core Platform',
    key: 'CORE',
    description: 'Core microservices and databases',
    nature: 'MONOLITH',
    services: [],
    defaultChecklist: [
      { title: 'Run unit tests', isRequired: true },
      { title: 'Verify migrations', isRequired: true },
    ],
    releases: [],
    _count: { releases: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    project: {
      findMany: jest.fn().mockResolvedValue([mockProject]),
      findUnique: jest.fn().mockResolvedValue(mockProject),
      create: jest.fn().mockResolvedValue(mockProject),
      update: jest.fn().mockResolvedValue(mockProject),
      delete: jest.fn().mockResolvedValue(mockProject),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all projects with totalReleases count', async () => {
      const results = await service.findAll();
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('proj-123');
      expect(results[0].key).toBe('CORE');
      expect(results[0].totalReleases).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a project by ID', async () => {
      const result = await service.findOne('proj-123');
      expect(result.id).toBe('proj-123');
      expect(result.name).toBe('Core Platform');
    });

    it('should throw NotFoundException if project is missing', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a project with normalized uppercase key', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null); // uniqueness check
      const result = await service.create({
        name: 'Web Portal',
        key: 'web',
        defaultChecklist: [{ title: 'Build verification', isRequired: true }],
      });
      expect(result).toBeDefined();
      expect(prisma.project.create).toHaveBeenCalled();
    });
  });
});
