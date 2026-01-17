import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const configService = app.get(ConfigService);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const adminEmail = configService.getOrThrow<string>('ADMIN_EMAIL');
  const adminPassword = configService.getOrThrow<string>('ADMIN_PASSWORD');

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    await app.close();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = userRepository.create({
    email: adminEmail,
    password: hashedPassword,
  });

  await userRepository.save(admin);

  console.log('🚀 Admin user created successfully');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed', err);
  process.exit(1);
});
