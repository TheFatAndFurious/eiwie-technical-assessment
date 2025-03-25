import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { SignInDto } from './dto/sign-in.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') input: SignInDto): Promise<LoginResponseDto> {
    return this.authService.signIn(input);
  }
}
