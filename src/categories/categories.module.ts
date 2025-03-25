import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategoriesSchema } from './schemas/categories.schema';
import { UsersResolver } from '../users/users.resolver';
import { TransactionsModule } from '../transactions/transactions.module';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transactions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    TransactionsModule,
  ],
  providers: [CategoriesService, CategoriesResolver],
})
export class CategoriesModule {}
