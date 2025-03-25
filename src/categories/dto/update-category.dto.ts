import { IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateCategoryDto {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field()
  @IsOptional()
  @IsString()
  categoryId: string;
}
