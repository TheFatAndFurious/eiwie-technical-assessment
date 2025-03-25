import {Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import JWTPayload from './interfaces/jwt-payload.interface';
import {User} from "../users/schemas/users.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<LoginResponseDto> {
    let user: User | null = null;
    try {
      user = await this.usersService.findByEmail(email);
    } catch (error) {
      console.error('DB error: couldnt get user', error);
      throw new InternalServerErrorException("DB error: could not find user");
    }

    // Case: we cant find the user by its email
    if (!user) {
      throw new UnauthorizedException('Invalid crendentials');
    }

    // Case: passwords doesn't match'
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('email or password doesnt match');
    }

    const payload: JWTPayload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };

    const token: string = this.jwtService.sign(payload);

    const { password: _, ...safeUser } = user.toObject();

    // TODO: create a Type for the sanitized user we are returning
    return {
      accessToken: token,
      user: safeUser,
    };
  }
}
