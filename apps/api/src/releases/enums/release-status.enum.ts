import { registerEnumType } from '@nestjs/graphql';
import { ReleaseStatus, StepStatus } from '@prisma/client';

export { ReleaseStatus, StepStatus };

registerEnumType(ReleaseStatus, {
  name: 'ReleaseStatus',
  description: 'The lifecycle state of a software release',
});

registerEnumType(StepStatus, {
  name: 'StepStatus',
  description: 'The verification status of a release checklist step',
});
