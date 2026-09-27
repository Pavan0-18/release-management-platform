import { gql } from '@apollo/client';

export const GET_HEALTH = gql`
  query GetHealth {
    health
  }
`;

export const GET_HEALTH_STATUS = gql`
  query GetHealthStatus {
    health
    healthStatus {
      status
      timestamp
      uptime
      database
      environment
    }
  }
`;
