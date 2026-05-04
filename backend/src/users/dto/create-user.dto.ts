import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'manager@teamflow.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Manager' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;

  @ApiProperty({ enum: Role, example: Role.MANAGER, required: false })
  @IsEnum(Role)
  role!: Role;
}
