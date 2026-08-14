import fs from 'fs';
import path from 'path';
import { pool, query } from './pool';

export async function initializeDatabase(): Promise<void> {
  try {
    // Check if tables already exist
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tableExists = checkTable.rows[0]?.exists;

    if (!tableExists) {
      console.log('Database tables not found. Running schema.sql migration...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Schema migration executed successfully.');

      console.log('Running initial seed.sql...');
      const seedPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await pool.query(seedSql);
        console.log('Seed data inserted successfully.');
      }
    } else {
      console.log('Database schema already initialized.');
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    // Don't crash immediately in dev, allows manual migration if needed
  }
}
