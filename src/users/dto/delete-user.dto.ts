import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class DeleteUserDto {
  @Field()
  @IsString()
  password: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}
