import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsNumber, IsPositive, IsString } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateIncomeDto {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsNumber()
  @IsPositive()
  amount: number;

  @Field()
  @IsDate()
  date: Date;

  @Field()
  @IsString()
  userId: Types.ObjectId;
}
