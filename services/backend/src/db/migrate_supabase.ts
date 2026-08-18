import { pool, query } from './pool';
import { initializeDatabase } from './init';

async function main() {
  console.log('Connecting to Supabase PostgreSQL...');
  try {
    const res = await query('SELECT NOW() as current_time, version();');
    console.log('Supabase Connection Success:');
    console.log('Server Time:', res.rows[0].current_time);
    console.log('PostgreSQL Version:', res.rows[0].version);

    console.log('\nRunning database schema initialization and seed on Supabase...');
    await initializeDatabase();

    const users = await query('SELECT username, role, credit_limit, available_credit FROM users ORDER BY role;');
    console.log('\nSupabase Users in Database:');
    console.table(users.rows);

    const accounts = await query('SELECT display_name, account_type, is_active, is_primary FROM deposit_accounts;');
    console.log('\nSupabase Deposit Accounts in Database:');
    console.table(accounts.rows);

    console.log('\nALL SUPABASE MIGRATIONS AND SEEDS COMPLETED SUCCESSFULLY!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Supabase Migration Error:', error);
    await pool.end();
    process.exit(1);
  }
}

main();
