import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsResolver } from './transactions.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transactions.schema';
import {Categories} from "../categories/schemas/categories.schema";
import {redisProvider} from "../redis/provider";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Categories.name, schema: Categories },
    ]),
  ],
  providers: [TransactionsService, TransactionsResolver, redisProvider],
})
export class TransactionsModule {}
