-- Temporary fix: Make page_slug nullable during school creation
-- Then we'll handle page creation properly in the application

-- Step 1: Make page_slug nullable temporarily
ALTER TABLE pages ALTER COLUMN page_slug DROP NOT NULL;

-- Step 2: Update any remaining NULL values
UPDATE pages 
SET page_slug = COALESCE(page_type, 'homepage')
WHERE page_slug IS NULL;

-- Step 3: Create a function to ensure page_slug is set when pages are created
CREATE OR REPLACE FUNCTION ensure_page_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- If page_slug is NULL, set it based on page_type or default to 'homepage'
  IF NEW.page_slug IS NULL THEN
    NEW.page_slug = COALESCE(NEW.page_type, 'homepage');
  END IF;
  
  -- If page_slug is still NULL or empty, set to 'homepage'
  IF NEW.page_slug IS NULL OR NEW.page_slug = '' THEN
    NEW.page_slug = 'homepage';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-set page_slug
DROP TRIGGER IF EXISTS ensure_page_slug_trigger ON pages;
CREATE TRIGGER ensure_page_slug_trigger
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION ensure_page_slug();

-- Step 5: Now make page_slug NOT NULL again (this should work now)
ALTER TABLE pages ALTER COLUMN page_slug SET NOT NULL;

-- Step 6: Ensure unique constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pages_school_page_unique'
    ) THEN
        ALTER TABLE pages ADD CONSTRAINT pages_school_page_unique UNIQUE (school_id, page_slug);
    END IF;
END $$;

SELECT 'Enhanced page_slug handling implemented successfully!' as status;
