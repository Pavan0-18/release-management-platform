import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Default checklist item template' })
export class DefaultChecklistItemModel {
  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean)
  isRequired!: boolean;
}
