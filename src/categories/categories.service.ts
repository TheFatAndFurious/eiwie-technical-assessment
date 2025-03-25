import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categories } from './schemas/categories.schema';
import { Model } from 'mongoose';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { Transaction } from '../transactions/schemas/transactions.schema';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name)
    private readonly categoriesModel: Model<Categories>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Categories>,
  ) {}

  // We must make sure the category doesn't already exist for the user trying to create it. We must allow to
  // have the
  // same category name multiple times as they would each be created by a different user
  async create(createCategoriesDto: CreateCategoriesDto): Promise<Categories> {
    const existingCategory = await this.categoriesModel.findOne({
      name: createCategoriesDto.name,
      userId: createCategoriesDto.userId,
    });
    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = new this.categoriesModel(createCategoriesDto);
    return category.save();
  }

  // Making sure there is no transaction associated to the category we are trying to delete
  async delete(deleteCategoryDto: DeleteCategoryDto): Promise<boolean> {
    const transactionCount = await this.transactionModel.countDocuments({
      category: deleteCategoryDto.categoryId,
    });
    if (transactionCount) {
      throw new BadRequestException(
        `Cannot delete category as it is currently used in ${transactionCount} transaction(s)`,
      );
    }

    const wasItDeleted = await this.categoriesModel.deleteOne({
      _id: deleteCategoryDto.categoryId,
      userId: deleteCategoryDto.userId,
    });

    if (wasItDeleted.deletedCount == 0) {
      throw new ConflictException('You are not authorized to delete this data');
    }

    return true;
  }

  // We will only allow the user to update the category name and not his type as it would also modify transactions
  // (expenses could be changed to incomes...)
  //  TODO: allow update of category type if there is no transactions associated to the category
  async update(updateCategoryDto: UpdateCategoryDto): Promise<Categories> {
    const category = await this.categoriesModel.findOne({
      _id: updateCategoryDto.categoryId,
      userId: updateCategoryDto.userId,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.name === updateCategoryDto.name) {
      throw new ConflictException('Category already exists');
    }
    category.name = updateCategoryDto.name;
    return category.save();
  }

  async findByUser(userId: string): Promise<Categories[] | null> {
    const categories = await this.categoriesModel
      .find({ userId: userId })
      .lean()
      .exec();
    return categories;
  }
}
