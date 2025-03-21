import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  BOTH = 'BOTH',
}

registerEnumType(CategoryType, {
  name: 'CategoryType',
});

@ObjectType()
@Schema({ timestamps: true })
export class Categories extends Document {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field(() => CategoryType)
  @Prop({ enum: Object.values(CategoryType) })
  type: CategoryType;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;
}
export const CategoriesSchema = SchemaFactory.createForClass(Categories);
