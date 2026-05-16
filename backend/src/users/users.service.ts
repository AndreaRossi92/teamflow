import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '../app-error.codes';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(@InjectRepository(User) repo: Repository<User>) {
    super(repo);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(ErrorCode.USER_EMAIL_ALREADY_EXISTS);
      }
      throw new ConflictException(ErrorCode.USER_INACTIVE);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ ...dto, passwordHash });
    return this.repo.save(user);
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    if (!user.isActive)
      throw new BadRequestException(ErrorCode.USER_ALREADY_INACTIVE);

    user.isActive = false;
    return this.repo.save(user);
  }

  async reactivateUser(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    if (user.isActive)
      throw new BadRequestException(ErrorCode.USER_ALREADY_ACTIVE);

    user.isActive = true;
    return this.repo.save(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { passwordHash });
  }
}
