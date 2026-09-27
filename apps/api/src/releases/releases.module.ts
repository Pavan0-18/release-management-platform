import { Module } from '@nestjs/common';
import { ReleasesResolver } from './releases.resolver';
import { ReleasesService } from './releases.service';

@Module({
  providers: [ReleasesResolver, ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
