import { Redis } from '@upstash/redis';

let redis;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
  } else {
    // Proxy fallback prevents module import crash on Vercel
    redis = new Proxy({}, {
      get() {
        return () => {
          throw new Error('Upstash Redis configuration missing in Vercel. Please check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
        };
      }
    });
  }
} catch (err) {
  console.error('Redis initialization error:', err);
  redis = new Proxy({}, {
    get() {
      return () => {
        throw new Error('Failed to initialize Redis client: ' + err.message);
      };
    }
  });
}

export default redis;