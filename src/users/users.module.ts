import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import {
  Categories,
  CategoriesSchema,
} from '../categories/schemas/categories.schema';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transactions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Categories.name, schema: CategoriesSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
