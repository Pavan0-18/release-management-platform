import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { ReleasesModule } from './releases/releases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(__dirname, 'schema.gql'),
        sortSchema: true,
        path: configService.get<string>('graphql.path', '/graphql'),
        playground: configService.get<boolean>('graphql.playground', true),
        introspection: true,
        context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
        formatError: (error) => {
          const originalError = error.extensions?.originalError as any;
          const message = Array.isArray(originalError?.message)
            ? originalError.message.join(', ')
            : originalError?.message || error.message || 'An unexpected error occurred';

          return {
            message,
            code:
              error.extensions?.code ||
              (originalError?.statusCode === 400
                ? 'BAD_USER_INPUT'
                : originalError?.statusCode === 404
                  ? 'NOT_FOUND'
                  : originalError?.statusCode === 409
                    ? 'CONFLICT'
                    : 'INTERNAL_SERVER_ERROR'),
            statusCode: originalError?.statusCode || 500,
            locations: error.locations,
            path: error.path,
          };
        },
      }),
    }),
    PrismaModule,
    HealthModule,
    ProjectsModule,
    ReleasesModule,
  ],
})
export class AppModule {}
