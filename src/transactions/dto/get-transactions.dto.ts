import { ArgsType, Field } from '@nestjs/graphql';
import { TransactionType } from '../schemas/transactions.schema';
import {IsDateString, IsEnum, IsOptional, IsString} from 'class-validator';

@ArgsType()
export class GetTransactionsDto {
  @Field(() => TransactionType, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  date?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  endDate?: string;
}
