import fs from 'fs';
import path from 'path';
import { pool, query } from './pool';

export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bet_type_enum AS ENUM ('BACK', 'LAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bet_status_enum AS ENUM ('MATCHED', 'PARTIALLY_MATCHED', 'UNMATCHED', 'SETTLED', 'CANCELLED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (credit_limit >= 0),
    available_credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    exposure NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (exposure >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markets (
    id VARCHAR(100) PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    market_type VARCHAR(50) NOT NULL DEFAULT 'MATCH_ODDS',
    sport VARCHAR(50) NOT NULL DEFAULT 'Cricket',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    in_play BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SUSPENDED', 'SETTLED', 'CLOSED')),
    winning_selection_id INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_selections (
    id SERIAL PRIMARY KEY,
    market_id VARCHAR(100) NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    selection_id INT NOT NULL,
    selection_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(market_id, selection_id)
);

CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    market_id VARCHAR(100) NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
    selection_id INT NOT NULL,
    type bet_type_enum NOT NULL,
    price NUMERIC(8, 2) NOT NULL CHECK (price > 1.00),
    stake NUMERIC(15, 2) NOT NULL CHECK (stake > 0.00),
    matched_stake NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (matched_stake >= 0.00),
    liability NUMERIC(15, 2) NOT NULL CHECK (liability >= 0.00),
    status bet_status_enum NOT NULL DEFAULT 'UNMATCHED',
    pnl NUMERIC(15, 2) DEFAULT 0.00,
    matched_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id VARCHAR(100) NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
    selection_id INT NOT NULL,
    back_bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE RESTRICT,
    lay_bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE RESTRICT,
    back_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    lay_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    price NUMERIC(8, 2) NOT NULL,
    stake NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0.00),
    transaction_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deposit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_type VARCHAR(50) NOT NULL, -- 'BANK', 'UPI', 'QR', 'CRYPTO'
    display_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100),
    account_holder VARCHAR(100),
    account_number VARCHAR(100),
    ifsc_code VARCHAR(50),
    branch VARCHAR(100),
    upi_id VARCHAR(100),
    qr_code_url TEXT,
    crypto_network VARCHAR(50),
    crypto_address VARCHAR(150),
    min_deposit NUMERIC(15, 2) NOT NULL DEFAULT 100.00,
    max_deposit NUMERIC(15, 2) NOT NULL DEFAULT 500000.00,
    daily_limit NUMERIC(15, 2) NOT NULL DEFAULT 2000000.00,
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_method_id UUID REFERENCES deposit_accounts(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0.00),
    utr_reference VARCHAR(100) NOT NULL,
    deposit_account_details JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    processed_by UUID REFERENCES users(id),
    proof_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0.00),
    payout_method VARCHAR(50) NOT NULL,
    account_details JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    processed_by UUID REFERENCES users(id),
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS otps (
    phone VARCHAR(30) PRIMARY KEY,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_bets_user_status ON bets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bets_market_selection ON bets(market_id, selection_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_sender ON ledger_entries(sender_id);
CREATE INDEX IF NOT EXISTS idx_ledger_receiver ON ledger_entries(receiver_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger_entries(transaction_type);
CREATE INDEX IF NOT EXISTS idx_deposit_accounts_type ON deposit_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_deposit_accounts_active ON deposit_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_utr ON deposits(utr_reference);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_market_selections_market ON market_selections(market_id);
CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market_id);
`;

export const SEED_SQL = `
INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES 
('00000000-0000-0000-0000-000000000000', 'admin', '$2a$10$Qr6as5Xn9lxhDsJh9JgaC.lCWApDJE9QtcLdZs53rLpqAV5gFfrzO', 'ADMIN', NULL, 10000000.00, 10000000.00, 0.00, TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'supermaster_asia', '$2a$10$4rW3brj2QGjMIWvS7Q7nI.5VkIyBAHjJOuDZ3wjRxaRJ66a883R4C', 'SUPER_MASTER', '00000000-0000-0000-0000-000000000000', 500000.00, 500000.00, 0.00, TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES 
('22222222-2222-2222-2222-222222222222', 'master_mumbai', '$2a$10$LlhxqsYY1N7mIplec8lN8eISi9yRL/RqpX8zylxUrS6kd7vfK4k0.', 'MASTER', '11111111-1111-1111-1111-111111111111', 100000.00, 100000.00, 0.00, TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES 
('33333333-3333-3333-3333-333333333333', 'agent_vikram', '$2a$10$7lBiGowTTp5L0i3d2XKxe.NDF1ZS621plw8aN78uxGhiqQ7ymBdym', 'AGENT', '22222222-2222-2222-2222-222222222222', 25000.00, 25000.00, 0.00, TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES 
('44444444-4444-4444-4444-444444444444', 'player_rahul', '$2a$10$wOuyUGhwalgRIlzVzZV9b.uAFXw61vhEnM6UMynWIxEUc7NJeUQb2', 'USER', '33333333-3333-3333-3333-333333333333', 10000.00, 10000.00, 0.00, TRUE),
('55555555-5555-5555-5555-555555555555', 'player_amit', '$2a$10$pmpJt5DwkfH2.iXytBBbkutBUmPHDU5qY63fts5CjozqMTXYfVvsG', 'USER', '33333333-3333-3333-3333-333333333333', 10000.00, 10000.00, 0.00, TRUE)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
VALUES 
('MKT_IND_AUS_T20', 'India vs Australia - 2nd T20 International', 'MATCH_ODDS', 'Cricket', FALSE, TRUE, 'OPEN'),
('MKT_ARS_CHE_PL', 'Arsenal vs Chelsea - Premier League Derby', 'MATCH_ODDS', 'Football', FALSE, TRUE, 'OPEN'),
('MKT_ALC_SIN_WIM', 'Carlos Alcaraz vs Jannik Sinner - Wimbledon Final', 'MATCH_ODDS', 'Tennis', FALSE, TRUE, 'OPEN'),
('MKT_LAL_BOS_NBA', 'Los Angeles Lakers vs Boston Celtics - NBA Showcase', 'MATCH_ODDS', 'Basketball', FALSE, TRUE, 'OPEN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO market_selections (market_id, selection_id, selection_name)
VALUES 
('MKT_IND_AUS_T20', 1, 'India'),
('MKT_IND_AUS_T20', 2, 'Australia'),
('MKT_ARS_CHE_PL', 1, 'Arsenal'),
('MKT_ARS_CHE_PL', 2, 'Chelsea'),
('MKT_ARS_CHE_PL', 3, 'The Draw'),
('MKT_ALC_SIN_WIM', 1, 'Carlos Alcaraz'),
('MKT_ALC_SIN_WIM', 2, 'Jannik Sinner'),
('MKT_LAL_BOS_NBA', 1, 'LA Lakers'),
('MKT_LAL_BOS_NBA', 2, 'Boston Celtics')
ON CONFLICT (market_id, selection_id) DO NOTHING;

-- Seed Default Admin Managed Deposit Accounts
INSERT INTO deposit_accounts (id, account_type, display_name, bank_name, account_holder, account_number, ifsc_code, branch, upi_id, min_deposit, max_deposit, instructions, is_active, is_primary)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'BANK', 'ICICI Corporate Primary', 'ICICI Bank Ltd', 'NEXUSVIP ENTERPRISES LTD', '50200088912456', 'ICIC0000104', 'Nariman Point Mumbai', NULL, 500.00, 500000.00, 'Direct IMPS or RTGS deposit. Enter 12-digit UTR after transferring.', TRUE, TRUE),
('a0000000-0000-0000-0000-000000000002', 'BANK', 'HDFC Priority Fast Current', 'HDFC Bank Ltd', 'NEXUSVIP GLOBAL TRADING', '50100492819234', 'HDFC0000060', 'Connaught Place Delhi', NULL, 500.00, 500000.00, 'Instant 24x7 IMPS clearing. Auto-verified on UTR submission.', TRUE, FALSE),
('a0000000-0000-0000-0000-000000000003', 'UPI', 'Official Nexusvip Fast UPI', NULL, 'NEXUSVIP PAY', NULL, NULL, NULL, 'nexusvip.pay@icici', 100.00, 100000.00, 'Scan with PhonePe, Google Pay, Paytm, or BHIM. Enter 12-digit UTR immediately.', TRUE, TRUE),
('a0000000-0000-0000-0000-000000000004', 'CRYPTO', 'USDT TRC20 Hot Wallet', NULL, 'NEXUS VIP CRYPTO', NULL, NULL, NULL, NULL, 500.00, 1000000.00, 'Send USDT TRC-20 only. Enter TxHash reference after transfer.', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
`;

export async function initializeDatabase(): Promise<void> {
  try {
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tableExists = checkTable.rows[0]?.exists;

    if (!tableExists) {
      console.log('Database tables not found. Running schema migration...');
      await pool.query(SCHEMA_SQL);
      console.log('Schema migration executed successfully.');

      console.log('Running initial seed data insertion...');
      await pool.query(SEED_SQL);
      console.log('Seed data inserted successfully.');
    } else {
      console.log('Database schema already exists. Ensuring latest tables, default markets, and deposit accounts...');
      // Ensure new tables are created if updating existing schema
      await pool.query(SCHEMA_SQL).catch(err => {
        console.warn('Schema DDL note:', err.message);
      });
      await pool.query(SEED_SQL).catch(err => {
        console.warn('Seed insert note:', err.message);
      });
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}
