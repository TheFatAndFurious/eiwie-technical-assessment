import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TransactionType } from '../schemas/transactions.schema';

@InputType()
export class CreateTransaction {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$|^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in format DD-MM-YYYY or YYYY-MM-DD',
  })
  date: string;

  @Field(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => TransactionType)
  @IsEnum(TransactionType)
  type: TransactionType;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field()
  @IsString()
  category: string;
}
