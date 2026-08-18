-- ENTERPRISE MULTI-TIER SPORTS BETTING EXCHANGE
-- PostgreSQL 16 DDL Schema with Double-Entry Ledger and Exposure Locks

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up if re-running
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS market_selections CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS bet_status_enum CASCADE;
DROP TYPE IF EXISTS bet_type_enum CASCADE;
DROP TYPE IF EXISTS role_enum CASCADE;

-- Enums
CREATE TYPE role_enum AS ENUM ('ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT', 'USER');
CREATE TYPE bet_type_enum AS ENUM ('BACK', 'LAY');
CREATE TYPE bet_status_enum AS ENUM ('MATCHED', 'PARTIALLY_MATCHED', 'UNMATCHED', 'SETTLED', 'CANCELLED', 'SUSPENDED');

-- 1. Users Table with Hierarchical Parent-Child Constraints
CREATE TABLE users (
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_parent_hierarchy CHECK (
        (role = 'ADMIN' AND parent_id IS NULL) OR 
        (role != 'ADMIN' AND parent_id IS NOT NULL)
    )
);

-- 2. Markets Table
CREATE TABLE markets (
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

-- 3. Market Selections Table (Runners / Outcomes)
CREATE TABLE market_selections (
    id SERIAL PRIMARY KEY,
    market_id VARCHAR(100) NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    selection_id INT NOT NULL,
    selection_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(market_id, selection_id)
);

-- 4. Bets Table
CREATE TABLE bets (
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

-- 5. Matched Trades Log
CREATE TABLE trades (
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

-- 6. Double-Entry Ledger
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0.00),
    transaction_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Admin Managed Deposit Accounts (Bank Accounts & UPI / QR Codes)
CREATE TABLE deposit_accounts (
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

-- 8. Player Deposit Requests Queue (Admin Controlled Approval/Rejection)
CREATE TABLE deposits (
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

-- 9. Player Withdrawal Requests Queue (Admin Controlled Approval/Rejection)
CREATE TABLE withdrawals (
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

-- Strategic Indexes
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_bets_market_selection ON bets(market_id, selection_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_created_at ON bets(created_at);

CREATE INDEX idx_ledger_sender ON ledger_entries(sender_id);
CREATE INDEX idx_ledger_receiver ON ledger_entries(receiver_id);
CREATE INDEX idx_ledger_type ON ledger_entries(transaction_type);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at);

CREATE INDEX idx_deposit_accounts_type ON deposit_accounts(account_type);
CREATE INDEX idx_deposit_accounts_active ON deposit_accounts(is_active);

CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_utr ON deposits(utr_reference);
CREATE INDEX idx_deposits_created_at ON deposits(created_at);

CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at);

CREATE INDEX idx_market_selections_market ON market_selections(market_id);
CREATE INDEX idx_trades_market ON trades(market_id);
