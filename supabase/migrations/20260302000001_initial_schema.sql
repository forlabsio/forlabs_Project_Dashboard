CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'killed')),
  category TEXT,
  launch_date DATE,
  is_paid BOOLEAN DEFAULT false,
  pricing_model TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'KRW',
  entry_date DATE NOT NULL,
  note TEXT,
  revenue_type TEXT DEFAULT 'one-time' CHECK (revenue_type IN ('subscription', 'one-time', 'ads', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own services" ON services
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own revenue" ON revenue_entries
  FOR ALL USING (
    service_id IN (SELECT id FROM services WHERE user_id = auth.uid())
  );

CREATE POLICY "Users see own metrics" ON service_metrics
  FOR ALL USING (
    service_id IN (SELECT id FROM services WHERE user_id = auth.uid())
  );
