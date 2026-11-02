import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const client = (url && token) ? new Redis({ url, token }) : null;

// Simple local fallback for local development or if Redis is down
const localStore = {};

export const redis = {
  get: async (key) => {
    try {
      if (client) return await client.get(key);
    } catch (e) {
      console.error("Redis Get Error:", e);
    }
    return localStore[key] || null;
  },
  set: async (key, value) => {
    try {
      if (client) return await client.set(key, value);
    } catch (e) {
      console.error("Redis Set Error:", e);
    }
    localStore[key] = value;
    return "OK";
  }
};

export default redis;