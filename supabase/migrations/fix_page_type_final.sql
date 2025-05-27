-- Final fix for page_type/page_slug transition
-- This will complete the migration properly

-- First, let's make page_type nullable temporarily
ALTER TABLE pages ALTER COLUMN page_type DROP NOT NULL;

-- Update any NULL page_type values based on page_slug
UPDATE pages 
SET page_type = page_slug 
WHERE page_type IS NULL AND page_slug IS NOT NULL;

-- Update our upsert function to handle both fields during transition
-- We'll keep page_type for backward compatibility but use page_slug as primary

-- Ensure page_slug is the primary field
ALTER TABLE pages ALTER COLUMN page_slug SET NOT NULL;

-- Create index for page_slug if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_pages_page_slug ON pages(page_slug);

-- Optional: We can drop page_type later when we're sure everything works
-- ALTER TABLE pages DROP COLUMN page_type;

SELECT 'Page type/slug migration completed successfully!' as status;
