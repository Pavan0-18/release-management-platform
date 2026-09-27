import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

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
      }),
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
