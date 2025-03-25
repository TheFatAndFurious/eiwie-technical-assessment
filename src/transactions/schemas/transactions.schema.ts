import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Field, GraphQLISODateTime, ObjectType, registerEnumType} from '@nestjs/graphql';

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

registerEnumType(TransactionType, {
  name: 'TransactionType',
});

@ObjectType()
@Schema({ timestamps: true })
export class Transaction extends Document {
  @Field()
  @Prop({ maxlength: 50, required: true })
  title: string;

  @Field(() => GraphQLISODateTime)
  @Prop({ required: true })
  date: Date;

  @Field()
  @Prop({ required: true, min: 0 })
  amount: number;

  @Field(() => TransactionType)
  @Prop({ enum: Object.values(TransactionType), required: true })
  type: TransactionType;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'Categories', required: true })
  category: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
