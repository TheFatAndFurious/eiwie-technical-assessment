import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class DeleteTransactionDto {
  @Field()
  @IsString()
  transactionId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;
}
