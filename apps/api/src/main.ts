import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const host = configService.get<string>('apiHost', '0.0.0.0');
  const corsOrigin = configService.get<string>('corsOrigin', 'http://localhost:5173');
  const graphqlPath = configService.get<string>('graphql.path', '/graphql');

  app.enableCors({
    origin:
      corsOrigin === '*' ? true : [corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port, host);
  logger.log(`🚀 Release Management Platform API running on http://localhost:${port}`);
  logger.log(`📊 GraphQL Playground/Endpoint available at http://localhost:${port}${graphqlPath}`);
}

bootstrap();
