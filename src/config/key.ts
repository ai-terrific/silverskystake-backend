import crypto from 'crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'harrysocialdev';
export const SECRET_KEY = process.env.SECRET_KEY || 'harrydevsilversky';
export const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/silverskystake';
export const FRONTEND_URI =
  process.env.FRONTEND_URI || 'http://172.20.4.112:5000';
export const PORT = process.env.PORT || 8001;
export const LogLevel = process.env.LOG_LEVEL || 'debug';
export const BREVO = {
  url: process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
  key:
    process.env.BREVO_API_KEY ||
    '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',
  host: {
    name: process.env.BREVO_API_HOST_NAME || 'GSA',
    email:
      process.env.BREVO_API_HOST_MAIL || 'christianrichardson.tech@gmail.com',
  },
};
