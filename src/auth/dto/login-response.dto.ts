import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/schemas/users.schema';

@ObjectType()
export class LoginResponseDto {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
