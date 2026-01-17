import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtFromRequest: JwtFromRequestFunction = ExtractJwt.fromExtractors([
      (req: Request): string | null => {
        const cookies = req.cookies as { authToken: string };
        if (!cookies) return null;

        const token = cookies.authToken;
        return typeof token === 'string' ? token : null;
      },
    ]);

    super({
      jwtFromRequest,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET_KEY'),
    });
  }

  validate(payload: string) {
    return payload;
  }
}
