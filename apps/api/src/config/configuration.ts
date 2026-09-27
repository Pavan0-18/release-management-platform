export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiHost: process.env.API_HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/release_management?schema=public',
  },
  graphql: {
    path: process.env.GRAPHQL_PATH || '/graphql',
    playground: process.env.GRAPHQL_PLAYGROUND !== 'false',
  },
});
