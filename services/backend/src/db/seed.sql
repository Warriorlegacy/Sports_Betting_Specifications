-- SEED DATA FOR SPORTS EXCHANGE PLATFORM
-- Password for all seed accounts: "password123"
-- bcrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

-- 1. Insert Genesis Global Admin (L0)
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

-- 2. Insert Platform Genesis Credit Minting
INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
VALUES 
(NULL, '00000000-0000-0000-0000-000000000000', 10000000.00, 'SYSTEM_MINT', 'MINT_GENESIS', 'Platform genesis credit minting');

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
