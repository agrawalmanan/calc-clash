import { Redis } from '@upstash/redis';

// Fallback in-memory store if Redis credentials are missing or unreachable
const memoryStore = new Map();

let redisClient = null;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    redisClient = new Redis({ url, token });
  }
} catch (err) {
  console.warn('Upstash Redis initialization warning:', err.message);
}

export const redis = {
  get: async (key) => {
    if (redisClient) {
      try {
        const val = await redisClient.get(key);
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
      } catch (err) {
        console.warn('Redis GET failed, using memory store fallback:', err.message);
      }
    }
    return memoryStore.get(key) || null;
  },

  set: async (key, value) => {
    memoryStore.set(key, value);
    if (redisClient) {
      try {
        await redisClient.set(key, value);
      } catch (err) {
        console.warn('Redis SET failed, using memory store fallback:', err.message);
      }
    }
    return 'OK';
  }
};

export default redis;