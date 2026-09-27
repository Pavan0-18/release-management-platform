import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProjectNature } from '@rmp/shared';
import { DefaultChecklistItemModel } from './default-checklist-item.model';
import { ReleaseModel } from '../../releases/models/release.model';

registerEnumType(ProjectNature, {
  name: 'ProjectNature',
  description: 'Architecture nature of project: MONOLITH or MICROSERVICES',
});

@ObjectType({ description: 'Project representation scoping releases and checklists' })
export class ProjectModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  key!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => ProjectNature, { defaultValue: ProjectNature.MONOLITH })
  nature: ProjectNature = ProjectNature.MONOLITH;

  @Field(() => [String], { nullable: 'itemsAndList' })
  services?: string[] | null;

  @Field(() => [DefaultChecklistItemModel], { nullable: 'itemsAndList' })
  defaultChecklist?: DefaultChecklistItemModel[] | null;

  @Field(() => [ReleaseModel], { nullable: 'itemsAndList' })
  releases?: ReleaseModel[];

  @Field(() => Int, { defaultValue: 0 })
  totalReleases: number = 0;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
