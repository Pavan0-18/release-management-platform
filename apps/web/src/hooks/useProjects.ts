import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, CreateProjectInput, UpdateProjectInput } from '@rmp/shared';
import { requestGraphQL } from '../api/graphqlClient';
import {
  GET_PROJECTS_GQL,
  GET_PROJECT_GQL,
  CREATE_PROJECT_GQL,
  UPDATE_PROJECT_GQL,
  DELETE_PROJECT_GQL,
} from '../graphql/projects.queries';
import { useToast } from '../components/common/toast';
import { releaseKeys } from './useReleases';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/* 1. Fetch all projects */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const data = await requestGraphQL<{ projects: Project[] }>(GET_PROJECTS_GQL);
      return data.projects;
    },
  });
}

/* 2. Fetch single project */
export function useProject(id?: string) {
  return useQuery({
    queryKey: projectKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const data = await requestGraphQL<{ project: Project }>(GET_PROJECT_GQL, { id });
      return data.project;
    },
    enabled: Boolean(id),
  });
}

/* 3. Create project */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const data = await requestGraphQL<{ createProject: Project }>(CREATE_PROJECT_GQL, { input });
      return data.createProject;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(
        `Project "${newProject.name}" created`,
        `Key: [${newProject.key}] with default verification checklist template.`,
      );
    },
    onError: (err: Error) => {
      toast.error('Failed to create project', err.message);
    },
  });
}

/* 4. Update project */
export function useUpdateProject(projectId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: UpdateProjectInput) => {
      const data = await requestGraphQL<{ updateProject: Project }>(UPDATE_PROJECT_GQL, { input });
      return data.updateProject;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      if (projectId || updated.id) {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId || updated.id) });
      }
      toast.success('Project updated', `Saved changes for ${updated.name}.`);
    },
    onError: (err: Error) => {
      toast.error('Failed to update project', err.message);
    },
  });
}

/* 5. Delete project */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await requestGraphQL<{ deleteProject: boolean }>(DELETE_PROJECT_GQL, { id });
      return data.deleteProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: releaseKeys.all });
      toast.success('Project deleted', 'Project and all associated releases removed.');
    },
    onError: (err: Error) => {
      toast.error('Failed to delete project', err.message);
    },
  });
}
