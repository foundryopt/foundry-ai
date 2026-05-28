import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'foundry-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  databaseUrl: process.env.DATABASE_URL || '',
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN || '',
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    smsChannel: process.env.SLACK_SMS_CHANNEL || '#ghl-sms',
  },
  ghl: {
    webhookSecret: process.env.GHL_WEBHOOK_SECRET || '',
  },
};
