import { createClient } from "redis";

let client: ReturnType<typeof createClient> | null = null;
let connected = false;

export async function getRedisClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("Redis client error:", err));
  }
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}
