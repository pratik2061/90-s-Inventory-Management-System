import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { JwtAuthGuard } from './jwt.auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.create(createUserDto);

    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = this.jwtService.sign(payload);

    res.cookie('authToken', token, {
      maxAge: 72 * 60 * 60 * 1000,
    });

    return {
      message: 'Logged in successfully',
    };
  }

  @UseGuards(JwtAuthGuard) // optional: only logged-in users can logout
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie
    res.clearCookie('authToken');

    return { message: 'Logged out successfully' };
  }
}
