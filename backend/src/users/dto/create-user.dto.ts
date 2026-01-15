import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  email: string;

  @Length(8, 20, { message: 'password must be between 8 and 20' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  password: string;
}
