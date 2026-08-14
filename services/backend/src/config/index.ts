import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super_secure_sports_exchange_jwt_secret_key_2026_xyz',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  commissionRate: parseFloat(process.env.COMMISSION_RATE || '0.02'), // 2% standard exchange commission
  databaseUrl: process.env.DATABASE_URL || 'postgresql://exchange_admin:exchange_secure_password_2026@localhost:5432/sports_exchange',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`
  },
  simulatorEnabled: process.env.SIMULATOR_ENABLED !== 'false'
};
