import { Field, ObjectType } from '@nestjs/graphql';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Income extends Document {
  @Field()
  @Prop()
  title: string;

  @Field(() => Number)
  @Prop({ required: true })
  amount: number;

  @Field()
  @Prop({ required: true })
  date: Date;

  @Field()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}


export const IncomesSchema = SchemaFactory.createForClass(Income);