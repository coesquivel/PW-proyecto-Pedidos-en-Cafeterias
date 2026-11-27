-- migrate:up
ALTER TABLE order_reviews
  ADD COLUMN store_reply VARCHAR(500),
  ADD COLUMN created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- migrate:down
ALTER TABLE order_reviews
  DROP COLUMN store_reply,
  DROP COLUMN created_at;
