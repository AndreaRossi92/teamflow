import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, IsUUID } from 'class-validator';

export class UserWithMemberDto {
  @ApiProperty()
  @IsUUID('4')
  id!: string;

  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  role!: string;

  @ApiProperty()
  @IsBoolean()
  isMember!: boolean;
}
