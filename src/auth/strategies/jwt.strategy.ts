import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import JWTPayload from '../interfaces/jwt-payload.interface';
import { CurrentUserInterface} from "../interfaces/current-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY') || 'babakar',
    });
  }

  async validate(payload: JWTPayload): Promise<CurrentUserInterface> {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
