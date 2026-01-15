import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(private readonly configService: ConfigService) {}
  create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

      if (!email || !password) {
        throw new BadRequestException('email or password is required');
      }
      if (email == adminEmail && password == adminPassword) {
        return {
          message: 'loggedIn',
        };
      } else {
        throw new ConflictException('Invalid credentials');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error ');
    }
  }
}
