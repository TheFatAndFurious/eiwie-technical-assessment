import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './schemas/users.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GqlAuthGuard } from 'src/auth/guards/gql-guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserInterface } from '../auth/interfaces/current-user.interface';
import { DeleteUserDto } from './dto/delete-user.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserDto): Promise<User> {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('input') input: UpdateUserDto,
    @CurrentUser() user: CurrentUserInterface,
  ): Promise<User> {
    const userInput = { ...input, userId: user.id };
    return this.usersService.updateProfile(userInput);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async me(
    @CurrentUser() user: { id: string; email: string },
  ): Promise<User | null> {
    return this.usersService.getProfile(user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteMe(
    @Args('input') input: DeleteUserDto,
    @CurrentUser() user: CurrentUserInterface,
  ) {
    const updatedInput = { ...input, userId: user.id };
    return this.usersService.deleteUser(updatedInput);
  }
}
