import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
  imports: [
    JwtModule.register({
      secret: 'changeMe',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  providers: [AuthResolver, AuthService, UsersService, JwtStrategy],
})
export class AuthModule {}
