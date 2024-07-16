import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  @Field(() => Comment, { nullable: true })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  @Field(() => [Comment], { nullable: 'itemsAndList' })
  children: Comment[];

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  text: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;
}
