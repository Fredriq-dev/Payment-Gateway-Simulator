/*
  OWNER: Person 1 (Foundation). Run with: npm run db:seed
  Creates one demo merchant with a fixed id so everyone can test before
  real registration exists. The password_hash is a placeholder, not a real hash.
*/
INSERT INTO users (id, business_name, email, password_hash, role, public_key, secret_key, webhook_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Merchant',
  'demo@merchant.test',
  'placeholder_hash',
  'merchant',
  'pk_test_demo',
  'sk_test_demo',
  'http://localhost:5000/api/v1/mock-merchant/webhook'
)
ON CONFLICT (id) DO NOTHING;
