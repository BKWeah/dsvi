-- Add payment_status column to schools table
ALTER TABLE schools ADD COLUMN payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'overdue'));

-- You might want to set a default value for existing rows if needed
-- UPDATE schools SET payment_status = 'paid' WHERE payment_status IS NULL;

-- Down migration to remove the column if needed
ALTER TABLE schools DROP COLUMN payment_status;
