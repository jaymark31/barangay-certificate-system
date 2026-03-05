-- Editable certificate content per request
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE REFERENCES requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_request_id ON certificates(request_id);

-- Ensure the shared updated_at trigger function exists (safe to re-run)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-update updated_at (recreate to avoid duplicates)
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
