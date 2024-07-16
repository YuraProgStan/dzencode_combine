import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true })
    parent: Comment;

    @OneToMany(() => Comment, (comment) => comment.parent)
    children: Comment[];

    @ManyToOne(() => User, (user) => user.comments, { eager: true })
    user: User;

    @Column()
    text: string;

    @Column({ nullable: true })
    fileUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
