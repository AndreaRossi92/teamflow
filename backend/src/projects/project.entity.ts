import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
  @ApiProperty({ example: 'uuid...' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'TeamFlow v2' })
  @Column()
  name!: string;

  @ApiProperty({ example: 'Main product rewrite', nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty({ example: 'uuid...' })
  @Column()
  createdById!: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @ApiProperty({ type: () => [User] })
  @ManyToMany(() => User, { eager: false })
  @JoinTable({
    name: 'project_members',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members!: User[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
