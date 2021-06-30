import Redis from 'ioredis';
export default new Redis(process.env['REDIS_URL'] || "redis://localhost:6379/0");
