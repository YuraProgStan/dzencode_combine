import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentSortBy } from './enums';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(@InjectRepository(Comment) private dataSource: DataSource) {
    super(Comment, dataSource.manager);
  }

  public async getCommentById(id) {
    return this.findOne(id);
  }

  public async searchComments(
    limit: number,
    offset: number,
    sortBy: CommentSortBy,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    let sortColumn: string;
    switch (sortBy) {
      case CommentSortBy.USERNAME:
        sortColumn = 'nc.user_username';
        break;
      case CommentSortBy.EMAIL:
        sortColumn = 'nc.user_email';
        break;
      case CommentSortBy.CREATED_AT:
      default:
        sortColumn = 'nc.comment_created_at';
        break;
    }

    const checkQuery = `
    SELECT 1 FROM "comment" c
    JOIN "user" u ON c."userId" = u.id
    WHERE c."parentId" IS NULL
    LIMIT 1;
  `;
    const checkResult = await this.query(checkQuery);
    if (checkResult.length === 0) {
      return [];
    }

    const query = `
WITH RECURSIVE nested_comments AS (
  SELECT
    c.id AS comment_id,
    c.text AS comment_text,
    c."fileUrl" AS comment_file_url,
    c."createdAt" AS comment_created_at,
    c."updatedAt" AS comment_updated_at,
    c."parentId" AS comment_parent_id,
    u.username AS user_username,
    u.email AS user_email,
    u.homepage AS user_homepage,
    1 AS depth,
    CAST('[]' AS JSONB) AS children -- Initialize empty JSONB array for children
  FROM
    "comment" c
  JOIN
    "user" u ON c."userId" = u.id
  WHERE
    c."parentId" IS NULL

  UNION ALL

  -- Recursive member: Select nested comments
  SELECT
    c.id,
    c.text,
    c."fileUrl",
    c."createdAt",
    c."updatedAt",
    c."parentId",
    u.username,
    u.email,
    u.homepage,
    nc.depth + 1 AS depth,
    CAST('[]' AS JSONB) AS children -- Initialize empty JSONB array for children
  FROM
    "comment" c
  JOIN
    "user" u ON c."userId" = u.id
  JOIN
    nested_comments nc ON c."parentId" = nc.comment_id
)
SELECT
  nc.comment_id,
  nc.comment_text,
  nc.comment_file_url,
  nc.comment_created_at,
  nc.comment_updated_at,
  nc.comment_parent_id,
  nc.user_username,
  nc.user_email,
  nc.user_homepage,
  nc.depth,
  COALESCE(nc.children, '[]'::JSONB) AS children
FROM (
  SELECT
    nc.comment_id,
    nc.comment_text,
    nc.comment_file_url,
    nc.comment_created_at,
    nc.comment_updated_at,
    nc.comment_parent_id,
    nc.user_username,
    nc.user_email,
    nc.user_homepage,
    nc.depth,
    COALESCE(jsonb_agg(nc_child.json_object ORDER BY nc_child.json_object->>'comment_created_at' DESC) FILTER (WHERE nc_child.json_object->>'comment_id' IS NOT NULL), '[]'::JSONB) AS children
  FROM
    nested_comments nc
  LEFT JOIN LATERAL (
    SELECT
      jsonb_build_object(
        'comment_id', nested.comment_id,
        'comment_text', nested.comment_text,
        'comment_file_url', nested.comment_file_url,
        'comment_created_at', nested.comment_created_at,
        'comment_updated_at', nested.comment_updated_at,
        'comment_parent_id', nested.comment_parent_id,
        'user_username', nested.user_username,
        'user_email', nested.user_email,
        'user_homepage', nested.user_homepage,
        'depth', nested.depth,
        'children', nested.children
      ) AS json_object
    FROM
      nested_comments nested
    WHERE
      nested.comment_parent_id = nc.comment_id
  ) AS nc_child ON true
  GROUP BY
    nc.comment_id,
    nc.comment_text,
    nc.comment_file_url,
    nc.comment_created_at,
    nc.comment_updated_at,
    nc.comment_parent_id,
    nc.user_username,
    nc.user_email,
    nc.user_homepage,
    nc.depth
) nc
ORDER BY ${sortColumn} ${sortOrder} limit ${limit} offset ${offset};`;
    const data = await this.query(query);
    return data;
  }

  async findCommentsRelationByIds(ids) {
    const comments = this.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .select([
        'comment.id',
        'comment.text',
        'comment.createdAt',
        'comment.fileUrl',
        'comment.parentId',
        'user.username',
        'user.email',
        'user.homepage',
      ])
      .where('comment.id IN (:...ids)', { ids })
      .getRawMany();
    return comments;
  }
}
