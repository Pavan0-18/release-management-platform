import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesResolver } from './releases.resolver';
import { ReleasesService } from './releases.service';
import { ReleaseStatus, StepStatus } from './enums/release-status.enum';

describe('ReleasesResolver', () => {
  let resolver: ReleasesResolver;
  let service: ReleasesService;

  const mockRelease = {
    id: 'rel-123',
    name: 'v1.0.0 Release',
    version: 'v1.0.0',
    description: 'First version',
    status: ReleaseStatus.DRAFT,
    steps: [],
    totalSteps: 0,
    completedSteps: 0,
    progressPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReleasesService = {
    findAll: jest.fn().mockResolvedValue([mockRelease]),
    findOne: jest.fn().mockResolvedValue(mockRelease),
    create: jest.fn().mockResolvedValue(mockRelease),
    update: jest.fn().mockResolvedValue(mockRelease),
    delete: jest.fn().mockResolvedValue(true),
    addStep: jest.fn().mockResolvedValue({
      id: 'step-1',
      title: 'Run test suite',
      status: StepStatus.PENDING,
    }),
    updateStep: jest.fn().mockResolvedValue({
      id: 'step-1',
      title: 'Run test suite',
      status: StepStatus.COMPLETED,
    }),
    deleteStep: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesResolver,
        {
          provide: ReleasesService,
          useValue: mockReleasesService,
        },
      ],
    }).compile();

    resolver = module.get<ReleasesResolver>(ReleasesResolver);
    service = module.get<ReleasesService>(ReleasesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('getReleases should call ReleasesService.findAll', async () => {
    const result = await resolver.getReleases();
    expect(result).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('getRelease should call ReleasesService.findOne', async () => {
    const result = await resolver.getRelease('rel-123');
    expect(result.id).toBe('rel-123');
    expect(service.findOne).toHaveBeenCalledWith('rel-123');
  });

  it('createRelease should call ReleasesService.create', async () => {
    const input = { projectId: 'proj-123', name: 'v1.0.0 Release', version: 'v1.0.0' };
    const result = await resolver.createRelease(input);
    expect(result).toBeDefined();
    expect(service.create).toHaveBeenCalledWith(input);
  });
});
