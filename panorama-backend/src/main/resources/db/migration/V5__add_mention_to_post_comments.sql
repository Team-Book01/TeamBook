ALTER TABLE `post_comments`
  ADD COLUMN `mention_user_id` BIGINT NULL COMMENT '답글 대상 유저 ID (NULL=대상 표시 없음)' AFTER `parent_comment_id`;