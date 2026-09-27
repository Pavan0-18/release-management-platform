import { Release } from './release.types';

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
  defaultChecklist?: DefaultChecklistItem[];
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  key?: string;
  description?: string;
  defaultChecklist?: DefaultChecklistItem[];
}
