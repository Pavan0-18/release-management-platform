import { gql } from '@apollo/client';

export const GET_RELEASES = gql`
  query GetReleases($filter: FilterReleasesInput) {
    releases(filter: $filter) {
      id
      name
      version
      description
      notes
      status
      targetDate
      totalSteps
      completedSteps
      progressPercentage
      createdAt
      updatedAt
      steps {
        id
        title
        status
        order
        isRequired
      }
    }
  }
`;

export const GET_RELEASE = gql`
  query GetRelease($id: ID!) {
    release(id: $id) {
      id
      name
      version
      description
      notes
      status
      targetDate
      totalSteps
      completedSteps
      progressPercentage
      createdAt
      updatedAt
      steps {
        id
        releaseId
        title
        description
        status
        order
        isRequired
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_RELEASE = gql`
  mutation CreateRelease($input: CreateReleaseInput!) {
    createRelease(input: $input) {
      id
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

export const UPDATE_RELEASE = gql`
  mutation UpdateRelease($input: UpdateReleaseInput!) {
    updateRelease(input: $input) {
      id
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

export const DELETE_RELEASE = gql`
  mutation DeleteRelease($id: ID!) {
    deleteRelease(id: $id)
  }
`;

export const ADD_RELEASE_STEP = gql`
  mutation AddReleaseStep($input: CreateReleaseStepInput!) {
    addReleaseStep(input: $input) {
      id
      releaseId
      title
      description
      status
      order
      isRequired
    }
  }
`;

export const UPDATE_RELEASE_STEP = gql`
  mutation UpdateReleaseStep($input: UpdateReleaseStepInput!) {
    updateReleaseStep(input: $input) {
      id
      title
      description
      status
      order
      isRequired
    }
  }
`;

export const DELETE_RELEASE_STEP = gql`
  mutation DeleteReleaseStep($id: ID!) {
    deleteReleaseStep(id: $id)
  }
`;
