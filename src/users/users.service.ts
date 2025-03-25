import {
  ConflictException,
  Injectable,
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

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword: string = await bcrypt.hash(password, 12);

    const createdUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async deleteUser(input: DeleteUserDto): Promise<boolean> {
    const existingUser: User | null = await this.userModel.findById(
      input.userId,
    );

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

    try {
      await Promise.all([
        this.userModel.deleteOne({ _id: input.userId }),
        this.transactionModel.deleteMany({ userId: input.userId }),
        this.categoriesModel.deleteMany({ userId: input.userId }),
      ]);
    } catch (error) {
      throw new NotFoundException('Failed to delete user data');
    }

    return true;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser: User | null = await this.userModel.findById(
      updateUserDto.userId,
    );

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
      const userWithEmail: User | null = await this.userModel.findOne({
        email: updateUserDto.email,
      });
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
    await existingUser.save();
    return existingUser;
  }
}
