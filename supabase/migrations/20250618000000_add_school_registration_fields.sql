-- Add year_established and permit_url fields to schools table
-- Date: 2025-06-18
-- Purpose: Support additional school registration information

-- Add year_established column (nullable integer)
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS year_established INTEGER;

-- Add permit_url column for permit/accreditation certificate upload
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS permit_url TEXT;

-- Add check constraint for year_established to be reasonable
ALTER TABLE schools 
ADD CONSTRAINT check_year_established_reasonable 
CHECK (year_established IS NULL OR (year_established >= 1800 AND year_established <= EXTRACT(YEAR FROM CURRENT_DATE) + 10));

-- Add comment for documentation
COMMENT ON COLUMN schools.year_established IS 'Year the school was established';
COMMENT ON COLUMN schools.permit_url IS 'URL to permit to operate or accreditation certificate document';

SELECT 'School registration fields added successfully!' as status;
