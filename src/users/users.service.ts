import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { Categories } from '../categories/schemas/categories.schema';
import { Transaction } from '../transactions/schemas/transactions.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Categories.name) private categoriesModel: Model<Categories>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    let existingUser: User | null = null;
    try {
      existingUser = await this.userModel.findOne({ email });
    } catch (error) {
      console.log('DB error: failed to verify if user exists', error);
      throw new NotFoundException('DB error: failed to search for user');
    }

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword: string = await bcrypt.hash(password, 12);

    const createdUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    let newUser: User | null;
    try {
      newUser = await createdUser.save();
    } catch (error) {
      console.error('DB error: failed to save new user', error);
      throw new InternalServerErrorException(
        'DB error: failed to save new user',
      );
    }

    return newUser;
  }

  async deleteUser(input: DeleteUserDto): Promise<boolean> {
    let existingUser: User | null;

    try {
      existingUser = await this.userModel.findById(input.userId);
    } catch (error) {
      console.error('DB error: failed to search for user', error);
      throw new InternalServerErrorException(
        'DB error: failed to search for user',
      );
    }

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      existingUser.password,
    );

    if (!passwordMatches) {
      throw new ConflictException('Invalid credentials');
    }

    // Here we use a promise to delete the user and everything he created
    try {
      await Promise.all([
        this.userModel.deleteOne({ _id: input.userId }),
        this.transactionModel.deleteMany({ userId: input.userId }),
        this.categoriesModel.deleteMany({ userId: input.userId }),
      ]);
    } catch (error) {
      console.error(
        'DB error: failed to delete user and its created data',
        error,
      );
      throw new InternalServerErrorException('Failed to delete user data');
    }

    return true;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (error) {
      console.error('DB error: failed to find user by its email', error);
      throw new InternalServerErrorException('DB error: Couldnt find the user');
    }
  }

  async getProfile(userId: string): Promise<User> {
    let user: User | null;
    try {
      user = await this.userModel.findOne({ _id: userId }).select('-password');
    } catch (error) {
      console.error('DB error: failed to find user', error);
      throw new InternalServerErrorException('Failed to find user', error);
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(updateUserDto: UpdateUserDto): Promise<User> {
    let existingUser: User | null;
    try {
      existingUser = await this.userModel.findById(updateUserDto.userId);
    } catch (error) {
      console.error('DB error: couldnt search for user', error);
      throw new InternalServerErrorException(
        'Failed to find user when looking for its existence',
      );
    }

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    const passwordMatches = await bcrypt.compare(
      updateUserDto.currentPassword,
      existingUser.password,
    );

    if (!passwordMatches) {
      throw new ConflictException('Passwords do not match');
    }

    if (updateUserDto.email) {
      let userWithEmail: User | null;
      try {
        userWithEmail = await this.userModel.findOne({
          email: updateUserDto.email,
        });
      } catch (error) {
        console.error('DB error: failed to find user', error);
        throw new InternalServerErrorException(
          'DB error: couldnt search for user',
        );
      }
      if (
        userWithEmail &&
        userWithEmail._id.toString() !== updateUserDto.userId
      ) {
        throw new ConflictException('Email is already in use.');
      }
    }

    if (updateUserDto.email) {
      existingUser.email = updateUserDto.email;
    }
    if (updateUserDto.username) {
      existingUser.username = updateUserDto.username;
    }
    if (updateUserDto.newPassword) {
      const hashedPassword = await bcrypt.hash(updateUserDto.newPassword, 12);
      existingUser.password = hashedPassword;
    }

    try {
      return await existingUser.save();
    } catch (error) {
      console.error('DB error: couldnt save updated user', error);
      throw new InternalServerErrorException(
        'DB error: couldnt save modifications for user',
      );
    }
  }
}
