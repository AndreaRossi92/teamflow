import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid...' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'admin@teamflow.com' })
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @ApiProperty({ enum: Role, example: Role.EMPLOYEE })
  @Column({
    type: 'text',
    enum: Role,
    default: Role.EMPLOYEE,
  })
  role!: Role;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
