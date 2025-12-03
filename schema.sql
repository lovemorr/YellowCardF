-- Yellow Card Policies table
CREATE TABLE IF NOT EXISTS yellow_card_policies (
  id SERIAL PRIMARY KEY,
  yellow_card_number VARCHAR(50) UNIQUE NOT NULL,
  pic_name VARCHAR(255),
  policy_number VARCHAR(100),
  issued_on VARCHAR(50),
  issued_timestamp VARCHAR(50),
  valid_from VARCHAR(50),
  valid_upto VARCHAR(50),
  customer_name VARCHAR(255),
  vehicle_make VARCHAR(100),
  vehicle_reg_number VARCHAR(50),
  countries_covered TEXT,
  vehicle_engine_number VARCHAR(100),
  vehicle_chassis_number VARCHAR(100),
  vehicle_color VARCHAR(50),
  no_of_seats VARCHAR(20),
  issuing_nb_contact VARCHAR(255),
  secretariat_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_yellow_card_number ON yellow_card_policies(yellow_card_number);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
