import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { DefaultChecklistItemModel } from './default-checklist-item.model';
import { ReleaseModel } from '../../releases/models/release.model';

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
