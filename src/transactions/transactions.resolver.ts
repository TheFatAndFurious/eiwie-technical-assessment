import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Transaction, TransactionType } from './schemas/transactions.schema';
import { TransactionsService } from './transactions.service';
import { CreateTransaction } from './dto/create-transactions.dto';
import {UseGuards, UseInterceptors} from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Mutation(() => Transaction)
  @UseGuards(GqlAuthGuard)
  async createTransaction(
    @Args('input') input: CreateTransaction,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Transaction> {
    const transactionInput = { ...input, userId: user.id };
    return this.transactionsService.create(transactionInput);
  }

  @Query(() => [Transaction])
  @UseGuards(GqlAuthGuard)
  async getMyTransactions(
    @Args() filters: GetTransactionsDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Transaction[]> {
    const transactionInput = { ...filters, userId: user.id };
    return this.transactionsService.findTransactions(transactionInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTransaction(
    @Args('input') input: DeleteTransactionDto,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    const rebuiltInput = { ...input, userId: user.id };
    return this.transactionsService.deleteTransaction(rebuiltInput);
  }

  @Mutation(() => Transaction)
  @UseGuards(GqlAuthGuard)
  async updateTransaction(
    @Args('input') input: UpdateTransactionDto,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    const rebuiltInput = { ...input, userId: user.id };
    return this.transactionsService.updateTransaction(rebuiltInput);
  }
}
