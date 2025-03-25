import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categories } from './schemas/categories.schema';
import {DeleteResult, Model} from 'mongoose';
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
    //TODO: normalize category name to lower case

    let existingCategory: Categories | null;
    try {
      existingCategory = await this.categoriesModel.findOne({
        name: createCategoriesDto.name,
        userId: createCategoriesDto.userId,
      });
    } catch (error) {
      console.error('DB error: could not search for category existence', error);
      throw new InternalServerErrorException(
        'DB error: could not verify category existence',
      );
    }

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = new this.categoriesModel(createCategoriesDto);

    try {
      return category.save();
    } catch (error) {
      console.error('DB error: could not save new category', error);
      throw new InternalServerErrorException(
        'DB error: could not save category',
      );
    }
  }

  async delete(deleteCategoryDto: DeleteCategoryDto): Promise<boolean> {
    // Making sure there is no transaction associated to the category we are trying to delete

    let transactionCount: number | null;
    try {
      transactionCount = await this.transactionModel.countDocuments({
        category: deleteCategoryDto.categoryId,
      });
    } catch (error) {
      console.error(
        'DB error: could not verify if there is any transactions associated',
        error,
      );
      throw new InternalServerErrorException(
        'DB error: couldnt proceed with deletion',
      );
    }

    if (transactionCount) {
      throw new BadRequestException(
        `Cannot delete category as it is currently used in ${transactionCount} transaction(s)`,
      );
    }

    let wasItDeleted: DeleteResult;
    try {
      wasItDeleted = await this.categoriesModel.deleteOne({
        _id: deleteCategoryDto.categoryId,
        userId: deleteCategoryDto.userId,
      });
    } catch (error){
      console.error('DB error: could not delete category', error);
      throw new InternalServerErrorException('DB error: could not delete category', error);
    }

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
