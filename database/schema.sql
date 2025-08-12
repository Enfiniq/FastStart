CREATE TABLE IF NOT EXISTS faststarts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  faststart TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  versions JSONB DEFAULT '["1.0.0"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faststarts_name ON faststarts(name);
CREATE INDEX IF NOT EXISTS idx_faststarts_author ON faststarts(author);
CREATE INDEX IF NOT EXISTS idx_faststarts_type ON faststarts(type);
CREATE INDEX IF NOT EXISTS idx_faststarts_created_at ON faststarts(created_at);

ALTER TABLE faststarts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on faststarts" ON faststarts
FOR ALL USING (true);