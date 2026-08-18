import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.mqxzzmwufakzaphujhtc:Piyushrajput@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing Prisma Client with PrismaPg adapter against live Supabase...');
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in Supabase via Prisma: ${userCount}`);

    const users = await prisma.user.findMany({
      select: { username: true, role: true, creditLimit: true, availableCredit: true },
    });
    console.log('Users retrieved via Prisma:');
    console.table(users);

    const depositAccounts = await prisma.depositAccount.findMany({
      select: { displayName: true, accountType: true, isActive: true, isPrimary: true },
    });
    console.log('Deposit Accounts via Prisma:');
    console.table(depositAccounts);

    const markets = await prisma.market.findMany({
      include: { selections: true },
    });
    console.log(`Live Markets loaded via Prisma: ${markets.length}`);
    for (const m of markets) {
      console.log(` - ${m.eventName} (${m.sport}): ${m.selections.map(s => s.selectionName).join(', ')}`);
    }

    console.log('\n======================================================');
    console.log(' SUCCESS: PRISMA + SUPABASE INTEGRATION 100% OPERATIONAL!');
    console.log('======================================================');
  } catch (e) {
    console.error('Prisma Supabase Test Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
