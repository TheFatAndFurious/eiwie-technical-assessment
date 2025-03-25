import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction } from './schemas/transactions.schema';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateTransaction } from './dto/create-transactions.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import {
  Categories,
  CategoryType,
} from '../categories/schemas/categories.schema';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { parseDate } from './helpers/parseDate';
import { generateCacheKey } from './helpers/generateCacheKey';
import { Redis } from 'ioredis';
import { invalidateRedisTransactions } from '../redis/helpers';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Categories.name) private categoriesModel: Model<CategoryType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  // Create a new transaction, whether it is expense or income
  async create(input: CreateTransaction): Promise<Transaction> {
    const { date, ...rest } = input;

    if (!isValidObjectId(input.category)) {
      throw new BadRequestException('Invalid category id');
    }

    let category: Categories | null;
    try {
      category = await this.categoriesModel.findById(input.category);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Database error: couldnt get category');
    }

    if (!category) {
      throw new NotFoundException('Category not found exception');
    }

    // @ts-ignore
    if (category.type != input.type) {
      throw new BadRequestException(
        `Category ${category.type} does not match the type of ${input.type}`,
      );
    }

    const parsedDate = parseDate(date);

    // We invalidate the cached transactions if there is a mutation on the Transactions collection
    try {
      await invalidateRedisTransactions('transactions*', this.redis);
    } catch (error) {
      console.error('Redis error: Couldnt clear the cache', error);
    }

    try {
      return new this.transactionModel({
        ...rest,
        date: parsedDate,
      }).save();
    } catch (error) {
      throw new BadRequestException(
        "DB error: Couldn't create new transaction",
      );
    }
  }

  async deleteTransaction(input: DeleteTransactionDto): Promise<boolean> {
    let deletedTransaction: Transaction | null;
    try {
      deletedTransaction = await this.transactionModel.findByIdAndDelete(
        input.transactionId,
      );
    } catch (error) {
      console.error('DB error: couldnt delete transaction', error);
      throw new BadRequestException('DB error while deleting transaction');
    }

    if (!deletedTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    try {
      await invalidateRedisTransactions(`transactions*`, this.redis);
    } catch (error) {
      console.error('Redis error: failed to clear the cache', error);
    }
    return true;
  }

  async updateTransaction(input: UpdateTransactionDto): Promise<Transaction> {
    // First we check if the transaction to update does exist
    const transactionToUpdate: Transaction | null =
      await this.transactionModel.findById(input.transactionId);
    if (!transactionToUpdate) {
      throw new NotFoundException('Transaction not found');
    }

    if (input.title) {
      transactionToUpdate.title = input.title;
    }

    if (input.amount) {
      transactionToUpdate.amount = input.amount;
    }

    if (input.date) {
      transactionToUpdate.date = parseDate(input.date);
    }

    await transactionToUpdate.save();
    return transactionToUpdate;
  }

  // Find transactions:
  async findTransactions(filters: GetTransactionsDto): Promise<Transaction[]> {
    const cacheKey: string = generateCacheKey(
      'transactions',
      filters.userId || 'test',
      filters,
    );
    try {
      // First thing we do is checking if there is a cached version of the query
      const ioRedisTestDeLaVictoire: string[] = await this.redis.keys(cacheKey);

      //If there is indeed a corresponding key we will use it to fetch the data from Redis then parse it as it
      // was stored as a string
      if (ioRedisTestDeLaVictoire.length > 0) {
        const cachedString: string | null = await this.redis.get(
          ioRedisTestDeLaVictoire[0],
        );

        if (cachedString) {
          try {
            const cachedData = JSON.parse(cachedString);
            // Here we need to recast the date as a Date since it has been changed as a string and creates a GraphQL
            // error
            const rehydrated = cachedData.map((tx: any) => ({
              ...tx,
              date: new Date(tx.date),
            }));
            return rehydrated;
          } catch (error) {
            console.error('Failed to parse redis data', error);
            await invalidateRedisTransactions('transactions*', this.redis);
          }
        }
      }
    } catch (error) {
      // We won't throw here as we will fall back on the database query if the cache isn't working properly
      console.error('Redis error', error);
    }

    const query: any = { userId: filters.userId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.date) {
      const startDate = parseDate(filters.date);
      const endDate = parseDate(filters.date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (filters.startDate && filters.endDate) {
      const startDay = parseDate(filters.startDate);
      const endDay = parseDate(filters.endDate);
      endDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startDay, $lte: endDay };
    } else if (filters.startDate) {
      console.log(filters.startDate);
      const startDay = parseDate(filters.startDate);
      query.date = { $gte: startDay };
    } else if (filters.endDate) {
      const endDay = parseDate(filters.endDate);
      endDay.setHours(23, 59, 59, 999);
      query.date = { $lte: endDay };
    }

    let results: Transaction[];

    try {
      results = await this.transactionModel.find(query).exec();
    } catch (error) {
      console.error('DB query failed for transactions', error);
      throw new BadRequestException(
        'Failed to fetch transactions from the database',
      );
    }

    // Setting the cache before returning the query
    try {
      await this.redis.set(cacheKey, JSON.stringify(results));
    } catch (error) {
      console.error("Redis error: couldn't set cache");
    }
    return results;
  }
}
