import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres.mqxzzmwufakzaphujhtc:Piyushrajput@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
      directUrl: process.env.DIRECT_URL || 'postgresql://postgres.mqxzzmwufakzaphujhtc:Piyushrajput@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
    },
  },
});
