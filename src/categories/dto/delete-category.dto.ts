import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class DeleteCategoryDto {
  @Field()
  @IsString()
  categoryId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}
