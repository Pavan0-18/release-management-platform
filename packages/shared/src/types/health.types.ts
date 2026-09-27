export interface HealthResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  database?: 'CONNECTED' | 'DISCONNECTED';
}

export interface PlatformMetadata {
  name: string;
  version: string;
  environment: string;
}
