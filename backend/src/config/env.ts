// import dotenv from 'dotenv';
// dotenv.config();

// function required(key: string): string {
//   const value = process.env[key];
//   if (!value) {
//     throw new Error(`Missing required environment variable: ${key}`);
//   }
//   return value;
// }

// export const env = {
//   nodeEnv: process.env.NODE_ENV || 'development',
//   port: Number(process.env.PORT) || 5000,
//   corsOrigin: process.env.CORS_ORIGIN || '*',
//   jwt: {
//     accessSecret: required('JWT_ACCESS_SECRET'),
//     refreshSecret: required('JWT_REFRESH_SECRET'),
//     accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
//     refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
//   },
// };

 import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
};