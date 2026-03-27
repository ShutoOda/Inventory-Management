-- 在庫テーブル作成
CREATE TABLE IF NOT EXISTS public.inventory (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT           NOT NULL,
  category    TEXT           NOT NULL,
  quantity    INTEGER        NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit        TEXT           NOT NULL,
  price       NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  description TEXT,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーをテーブルに適用
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 検索性能向上のためのインデックス
CREATE INDEX idx_inventory_name     ON public.inventory (name);
CREATE INDEX idx_inventory_category ON public.inventory (category);
