import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Release,
  ReleaseStatus,
  StepStatus,
  CreateReleaseInput,
  UpdateReleaseInput,
  CreateReleaseStepInput,
  UpdateReleaseStepInput,
} from '@rmp/shared';
import { requestGraphQL } from '../api/graphqlClient';
import { useToast } from '../components/common/toast';

/* GraphQL Query strings */
const GET_RELEASES_GQL = `
  query GetReleases($filter: FilterReleasesInput) {
    releases(filter: $filter) {
      id
      projectId
      serviceName
      project {
        id
        name
        key
        nature
        services
      }
      name
      version
      description
      notes
      status
      targetDate
      createdAt
      updatedAt
      totalSteps
      completedSteps
      progressPercentage
    }
  }
`;

const GET_RELEASE_GQL = `
  query GetRelease($id: ID!) {
    release(id: $id) {
      id
      projectId
      serviceName
      project {
        id
        name
        key
        nature
        services
        defaultChecklist {
          title
          description
          isRequired
        }
      }
      name
      version
      description
      notes
      status
      targetDate
      createdAt
      updatedAt
      totalSteps
      completedSteps
      progressPercentage
      steps {
        id
        title
        description
        isRequired
        status
        order
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_RELEASE_GQL = `
  mutation CreateRelease($input: CreateReleaseInput!) {
    createRelease(input: $input) {
      id
      projectId
      serviceName
      project {
        id
        name
        key
        nature
        services
      }
      name
      version
      description
      notes
      status
      targetDate
      totalSteps
      completedSteps
      progressPercentage
    }
  }
`;

const UPDATE_RELEASE_GQL = `
  mutation UpdateRelease($input: UpdateReleaseInput!) {
    updateRelease(input: $input) {
      id
      serviceName
      name
      version
      description
      notes
      status
      targetDate
      updatedAt
    }
  }
`;

const DELETE_RELEASE_GQL = `
  mutation DeleteRelease($id: ID!) {
    deleteRelease(id: $id)
  }
`;

const ADD_RELEASE_STEP_GQL = `
  mutation AddReleaseStep($input: CreateReleaseStepInput!) {
    addReleaseStep(input: $input) {
      id
      title
      description
      isRequired
      status
    }
  }
`;

const UPDATE_RELEASE_STEP_GQL = `
  mutation UpdateReleaseStep($input: UpdateReleaseStepInput!) {
    updateReleaseStep(input: $input) {
      id
      title
      description
      isRequired
      status
    }
  }
`;

const DELETE_RELEASE_STEP_GQL = `
  mutation DeleteReleaseStep($id: ID!) {
    deleteReleaseStep(id: $id)
  }
`;

export interface ReleaseFilterParams {
  projectId?: string;
  serviceName?: string;
  status?: ReleaseStatus;
  search?: string;
}

export const releaseKeys = {
  all: ['releases'] as const,
  lists: () => [...releaseKeys.all, 'list'] as const,
  list: (filter?: ReleaseFilterParams) => [...releaseKeys.lists(), filter] as const,
  details: () => [...releaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...releaseKeys.details(), id] as const,
};

/* 1. Fetch all releases */
export function useReleases(filter?: ReleaseFilterParams) {
  return useQuery({
    queryKey: releaseKeys.list(filter),
    queryFn: async () => {
      const data = await requestGraphQL<{ releases: Release[] }>(GET_RELEASES_GQL, {
        filter: {
          projectId: filter?.projectId || undefined,
          serviceName: filter?.serviceName || undefined,
          status: filter?.status || undefined,
          search: filter?.search || undefined,
        },
      });
      return data.releases;
    },
  });
}

/* 2. Fetch single release */
export function useRelease(id?: string) {
  return useQuery({
    queryKey: releaseKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Release ID is required');
      const data = await requestGraphQL<{ release: Release }>(GET_RELEASE_GQL, { id });
      return data.release;
    },
    enabled: Boolean(id),
  });
}

/* 3. Create release */
export function useCreateRelease() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: CreateReleaseInput) => {
      const data = await requestGraphQL<{ createRelease: Release }>(CREATE_RELEASE_GQL, { input });
      return data.createRelease;
    },
    onSuccess: (newRelease) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(
        `Release "${newRelease.name}" created`,
        `Version ${newRelease.version} is now available in project [${newRelease.project?.key || 'PROJECT'}].`,
      );
    },
    onError: (err: Error) => {
      toast.error('Failed to create release', err.message);
    },
  });
}

/* 4. Update release */
export function useUpdateRelease(releaseId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: UpdateReleaseInput) => {
      const data = await requestGraphQL<{ updateRelease: Release }>(UPDATE_RELEASE_GQL, { input });
      return data.updateRelease;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.all });
      if (releaseId || updated.id) {
        queryClient.invalidateQueries({ queryKey: releaseKeys.detail(releaseId || updated.id) });
      }
      toast.success('Release updated', `Status set to ${updated.status.replace(/_/g, ' ')}.`);
    },
    onError: (err: Error) => {
      toast.error('Failed to update release', err.message);
    },
  });
}

/* 5. Delete release */
export function useDeleteRelease() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await requestGraphQL<{ deleteRelease: boolean }>(DELETE_RELEASE_GQL, { id });
      return data.deleteRelease;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Release deleted', 'The release record and checklist steps have been removed.');
    },
    onError: (err: Error) => {
      toast.error('Failed to delete release', err.message);
    },
  });
}

/* 6. Add release step */
export function useAddReleaseStep(releaseId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: CreateReleaseStepInput) => {
      const data = await requestGraphQL<{ addReleaseStep: any }>(ADD_RELEASE_STEP_GQL, { input });
      return data.addReleaseStep;
    },
    onSuccess: (newStep) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(releaseId) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
      toast.success('Verification step added', newStep.title);
    },
    onError: (err: Error) => {
      toast.error('Failed to add checklist step', err.message);
    },
  });
}

/* 7. Update release step */
export function useUpdateReleaseStep(releaseId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: UpdateReleaseStepInput) => {
      const data = await requestGraphQL<{ updateReleaseStep: any }>(UPDATE_RELEASE_STEP_GQL, {
        input,
      });
      return data.updateReleaseStep;
    },
    onSuccess: (updatedStep) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(releaseId) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
      toast.info('Step updated', `${updatedStep.title}: ${updatedStep.status}`);
    },
    onError: (err: Error) => {
      toast.error('Failed to update checklist step', err.message);
    },
  });
}

/* 8. Delete release step */
export function useDeleteReleaseStep(releaseId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (stepId: string) => {
      const data = await requestGraphQL<{ deleteReleaseStep: boolean }>(DELETE_RELEASE_STEP_GQL, {
        id: stepId,
      });
      return data.deleteReleaseStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.detail(releaseId) });
      queryClient.invalidateQueries({ queryKey: releaseKeys.lists() });
      toast.info('Step removed', 'Checklist item removed from verification workflow.');
    },
    onError: (err: Error) => {
      toast.error('Failed to remove checklist step', err.message);
    },
  });
}
