-- 製品テーブル（親）
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code_number text NOT NULL,
  storage_location text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 在庫記録テーブル（子）
CREATE TABLE IF NOT EXISTS stock_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date date,
  status text NOT NULL CHECK (status IN ('+', '-')),
  quantity integer NOT NULL DEFAULT 0,
  ng integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT '未検',
  condition_text text,
  memo text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER stock_records_updated_at
  BEFORE UPDATE ON stock_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
