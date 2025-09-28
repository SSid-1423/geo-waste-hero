-- Add a constraint that municipality users must have an address
CREATE OR REPLACE FUNCTION validate_municipality_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'municipality' AND (NEW.address IS NULL OR LENGTH(TRIM(NEW.address)) = 0) THEN
    RAISE EXCEPTION 'Municipality users must provide an address';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_municipality_address_trigger ON public.profiles;
CREATE TRIGGER validate_municipality_address_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION validate_municipality_address();