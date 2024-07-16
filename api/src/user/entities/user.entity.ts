import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Comment } from '../../comment/entities/comment.entity';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Field()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  homepage?: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field(() => Date)
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.user, { nullable: true }) // Add nullable: true here
  @Field(() => [Comment], { nullable: true } as null)
  comments?: Comment[];
}
