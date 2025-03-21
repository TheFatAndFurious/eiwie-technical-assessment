import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CategoryType } from '../schemas/categories.schema';

@InputType()
export class CreateCategoriesDto {
  @Field()
  @IsString()
  name: string;

  @Field(() => CategoryType)
  @IsString()
  type: CategoryType;

  @Field()
  @IsString()
  userId: string;
}
