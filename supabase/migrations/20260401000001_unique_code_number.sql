-- code_number に一意制約を追加
ALTER TABLE products
  ADD CONSTRAINT products_code_number_unique UNIQUE (code_number);
