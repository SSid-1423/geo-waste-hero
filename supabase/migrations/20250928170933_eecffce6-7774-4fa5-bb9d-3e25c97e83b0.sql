-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION validate_municipality_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'municipality' AND (NEW.address IS NULL OR LENGTH(TRIM(NEW.address)) = 0) THEN
    RAISE EXCEPTION 'Municipality users must provide an address';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;