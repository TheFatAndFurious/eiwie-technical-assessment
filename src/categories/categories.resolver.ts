import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Categories } from './schemas/categories.schema';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-guard';
import {CurrentUser} from "../auth/decorators/current-user.decorator";
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Resolver(() => Categories)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard)
  async createCategory(
    @Args('input') input: CreateCategoriesDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Categories> {
    const categoryInput = { ...input, userId: user.id };
    return this.categoriesService.create(categoryInput);
  }

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard)
  async updateCategory(
    @Args('input') input: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Categories> {
    const categoryInput = { ...input, userId: user.id };
    return this.categoriesService.update(categoryInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCategory(@Args ('input') input: DeleteCategoryDto, @CurrentUser() user: CurrentUserInterface): Promise<boolean> {
    const categoryInput = { ...input, userId: user.id };
    return this.categoriesService.delete(categoryInput)
  }

  @Query(() => [Categories])
  @UseGuards(GqlAuthGuard)
  async getCategories(
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<Categories[] | null> {
    return this.categoriesService.findByUser(user.id);
  }
}
