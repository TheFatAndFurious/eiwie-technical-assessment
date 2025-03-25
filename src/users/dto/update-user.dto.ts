import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsString()
  @MinLength(4)
  @IsOptional()
  username?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({})
  @IsString()
  currentPassword: string;

  @Field({ nullable: true })
  @IsString()
  newPassword?: string;

  @Field({ nullable: true })
  @IsString()
  userId?: string;
}
