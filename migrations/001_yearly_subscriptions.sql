-- Comprehensive migration to support yearly subscriptions
-- Add missing columns for yearly subscription features

-- Add missing columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS has_priority_support BOOLEAN DEFAULT false;

-- Update existing subscriptions to have proper defaults
UPDATE subscriptions 
SET 
  billing_interval = COALESCE(billing_interval, 'month'),
  has_email_support = COALESCE(has_email_support, true),
  has_on_call_support = COALESCE(has_on_call_support, false),
  has_priority_support = COALESCE(has_priority_support, false)
WHERE billing_interval IS NULL OR has_email_support IS NULL OR has_on_call_support IS NULL OR has_priority_support IS NULL;

-- Set yearly subscriptions to have additional support features
UPDATE subscriptions 
SET 
  has_on_call_support = true,
  has_priority_support = true
WHERE billing_interval = 'year';

COMMIT;
