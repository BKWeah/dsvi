-- Data cleanup script for existing pages
-- Run this in Supabase SQL Editor to fix the page_slug issue

-- First, let's see what pages we have
SELECT id, title, page_type, page_slug, school_id FROM pages;

-- Update pages that have page_type but no page_slug
UPDATE pages 
SET page_slug = COALESCE(page_type, 'homepage')
WHERE page_slug IS NULL;

-- For any remaining NULL values, set them to 'homepage'
UPDATE pages 
SET page_slug = 'homepage'
WHERE page_slug IS NULL OR page_slug = '';

-- Verify the update
SELECT id, title, page_type, page_slug, school_id FROM pages;

-- Now make sure page_slug is not null (this should work now)
ALTER TABLE pages ALTER COLUMN page_slug SET NOT NULL;

-- Add the unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pages_school_page_unique') THEN
        ALTER TABLE pages ADD CONSTRAINT pages_school_page_unique UNIQUE (school_id, page_slug);
    END IF;
END $$;

SELECT 'Pages table cleanup completed successfully!' as status;
