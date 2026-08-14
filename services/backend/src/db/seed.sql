-- SEED DATA FOR SPORTS EXCHANGE PLATFORM
-- Password for all seed accounts: "password123"
-- bcrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

-- 1. Insert Global Admin (L0)
INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'ADMIN',
    NULL,
    10000000.00,
    10000000.00,
    0.00,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 2. Insert Super Master (L1)
INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'supermaster_asia',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'SUPER_MASTER',
    '00000000-0000-0000-0000-000000000000',
    500000.00,
    500000.00,
    0.00,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 3. Insert Master (L2)
INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'master_mumbai',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'MASTER',
    '11111111-1111-1111-1111-111111111111',
    100000.00,
    100000.00,
    0.00,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 4. Insert Agent (L3)
INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'agent_vikram',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'AGENT',
    '22222222-2222-2222-2222-222222222222',
    25000.00,
    25000.00,
    0.00,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 5. Insert Players (L4)
INSERT INTO users (id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'player_rahul',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'USER',
    '33333333-3333-3333-3333-333333333333',
    10000.00,
    10000.00,
    0.00,
    TRUE
),
(
    '55555555-5555-5555-5555-555555555555',
    'player_amit',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'USER',
    '33333333-3333-3333-3333-333333333333',
    10000.00,
    10000.00,
    0.00,
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- 6. Insert Initial Ledger Records
INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
VALUES 
(NULL, '00000000-0000-0000-0000-000000000000', 10000000.00, 'SYSTEM_MINT', 'MINT_GENESIS', 'Platform genesis credit minting'),
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 500000.00, 'CREDIT_ALLOCATION', 'ALLOC_L0_L1_01', 'Initial operational credit to Asia branch'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 100000.00, 'CREDIT_ALLOCATION', 'ALLOC_L1_L2_01', 'Allocation to Mumbai Master agency'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 25000.00, 'CREDIT_ALLOCATION', 'ALLOC_L2_L3_01', 'Allocation to Vikram Agent desk'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 10000.00, 'CREDIT_ALLOCATION', 'ALLOC_L3_L4_01', 'Player Rahul wallet provision'),
('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 10000.00, 'CREDIT_ALLOCATION', 'ALLOC_L3_L4_02', 'Player Amit wallet provision');

-- 7. Insert Initial Markets
INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
VALUES 
('MKT_IND_AUS_T20', 'India vs Australia - 2nd T20 International', 'MATCH_ODDS', 'Cricket', FALSE, TRUE, 'OPEN'),
('MKT_ARS_CHE_PL', 'Arsenal vs Chelsea - Premier League Derby', 'MATCH_ODDS', 'Football', FALSE, TRUE, 'OPEN'),
('MKT_ALC_SIN_WIM', 'Carlos Alcaraz vs Jannik Sinner - Wimbledon Final', 'MATCH_ODDS', 'Tennis', FALSE, TRUE, 'OPEN')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Market Selections (Runners)
INSERT INTO market_selections (market_id, selection_id, selection_name)
VALUES 
('MKT_IND_AUS_T20', 1, 'India'),
('MKT_IND_AUS_T20', 2, 'Australia'),

('MKT_ARS_CHE_PL', 1, 'Arsenal'),
('MKT_ARS_CHE_PL', 2, 'Chelsea'),
('MKT_ARS_CHE_PL', 3, 'The Draw'),

('MKT_ALC_SIN_WIM', 1, 'Carlos Alcaraz'),
('MKT_ALC_SIN_WIM', 2, 'Jannik Sinner')
ON CONFLICT (market_id, selection_id) DO NOTHING;
