CREATE TABLE catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku varchar(32) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT catalog_items_sku_format CHECK (sku ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'),
  CONSTRAINT catalog_items_name_nonempty CHECK (length(btrim(name)) > 0)
);
