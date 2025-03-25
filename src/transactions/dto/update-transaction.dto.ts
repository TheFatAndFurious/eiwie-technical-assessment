import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '../schemas/transactions.schema';

@InputType()
export class UpdateTransactionDto {
  @Field()
  @IsString()
  transactionId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  date?: string;
}
