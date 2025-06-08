
-- Add trial support to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS is_trial_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;

-- Update existing subscriptions to have proper defaults
UPDATE subscriptions 
SET 
  is_trial_mode = COALESCE(is_trial_mode, false)
WHERE is_trial_mode IS NULL;

COMMIT;
