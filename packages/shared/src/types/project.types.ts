import { Release } from './release.types';

export enum ProjectNature {
  MONOLITH = 'MONOLITH',
  MICROSERVICES = 'MICROSERVICES',
}

export interface DefaultChecklistItem {
  title: string;
  description?: string;
  isRequired: boolean;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  nature: ProjectNature;
  services?: string[] | null;
  defaultChecklist?: DefaultChecklistItem[] | null;
  releases?: Release[];
  totalReleases?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  nature?: ProjectNature;
  services?: string[];
  defaultChecklist?: DefaultChecklistItem[];
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  key?: string;
  description?: string;
  nature?: ProjectNature;
  services?: string[];
  defaultChecklist?: DefaultChecklistItem[];
}
