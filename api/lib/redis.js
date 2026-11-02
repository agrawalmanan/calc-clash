import { Redis } from '@upstash/redis';

// Global memory cache surviving warm Lambdas
if (!globalThis._calc_clash_memory_store) {
  globalThis._calc_clash_memory_store = new Map();
}
const memoryStore = globalThis._calc_clash_memory_store;

let redisClient = null;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token && typeof url === 'string' && url.startsWith('http')) {
    redisClient = new Redis({ url, token });
  }
} catch (err) {
  console.warn('Redis init note:', err.message);
}

export const redis = {
  get: async (key) => {
    if (redisClient) {
      try {
        const val = await redisClient.get(key);
        if (val !== null && val !== undefined) {
          if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
          }
          return val;
        }
      } catch (err) {
        console.warn('Redis read fallback:', err.message);
      }
    }
    return memoryStore.get(key) || null;
  },

  set: async (key, value) => {
    memoryStore.set(key, value);
    if (redisClient) {
      try {
        await redisClient.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
      } catch (err) {
        console.warn('Redis write fallback:', err.message);
      }
    }
    return 'OK';
  }
};

export default redis;