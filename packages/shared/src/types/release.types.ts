import { Project } from './project.types';

export enum ReleaseStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_DEPLOYMENT = 'READY_FOR_DEPLOYMENT',
  DEPLOYED = 'DEPLOYED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  SKIPPED = 'SKIPPED',
}

export interface ReleaseStep {
  id: string;
  releaseId: string;
  title: string;
  description?: string | null;
  status: StepStatus;
  order: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Release {
  id: string;
  projectId: string;
  project?: Project;
  serviceName?: string | null;
  name: string;
  version: string;
  description?: string | null;
  status: ReleaseStatus;
  targetDate?: string | null;
  steps: ReleaseStep[];
  totalSteps?: number;
  completedSteps?: number;
  progressPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseInput {
  projectId: string;
  serviceName?: string;
  name: string;
  version: string;
  description?: string;
  targetDate?: string;
  steps?: CreateStepInlineInput[];
}

export interface CreateStepInlineInput {
  title: string;
  description?: string;
  isRequired?: boolean;
}

export interface UpdateReleaseInput {
  id: string;
  serviceName?: string;
  name?: string;
  version?: string;
  description?: string;
  status?: ReleaseStatus;
  targetDate?: string;
}

export interface CreateReleaseStepInput {
  releaseId: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  order?: number;
}

export interface UpdateReleaseStepInput {
  id: string;
  title?: string;
  description?: string;
  status?: StepStatus;
  isRequired?: boolean;
  order?: number;
}
