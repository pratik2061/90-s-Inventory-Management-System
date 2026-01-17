import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  // users.service.ts
  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    if (!email || !password) {
      throw new BadRequestException('email or password is required');
    }

    const admin = await this.userRepo.findOne({ where: { email } });

    if (!admin) {
      throw new ConflictException('Seed before login');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return admin; // return user, not cookie
  }
}
