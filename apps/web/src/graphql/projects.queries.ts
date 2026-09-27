export const GET_PROJECTS_GQL = `
  query GetProjects {
    projects {
      id
      name
      key
      description
      defaultChecklist {
        title
        description
        isRequired
      }
      totalReleases
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT_GQL = `
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      key
      description
      defaultChecklist {
        title
        description
        isRequired
      }
      totalReleases
      releases {
        id
        name
        version
        description
        status
        targetDate
        totalSteps
        completedSteps
        progressPercentage
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROJECT_GQL = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      key
      description
      defaultChecklist {
        title
        description
        isRequired
      }
      totalReleases
      createdAt
    }
  }
`;

export const UPDATE_PROJECT_GQL = `
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      id
      name
      key
      description
      defaultChecklist {
        title
        description
        isRequired
      }
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_GQL = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;
