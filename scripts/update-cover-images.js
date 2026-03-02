/**
 * Update cover images for the 3 new blog posts.
 * Run: node scripts/update-cover-images.js
 */
const { createClient } = require("redis");
const fs = require("fs");
const path = require("path");

// Parse .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
});

const POSTS_KEY = "blog:posts";

const coverImages = {
  "how-to-calculate-meeting-cost":
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
  // Calculator, numbers, financial planning
  "why-meetings-are-so-expensive":
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1600&q=80",
  // Frustrated person in meeting / money waste
  "reduce-meeting-costs-tips":
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
  // Productive team collaboration / efficient meeting
};

async function main() {
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();
  console.log("Connected to Redis");

  const raw = await redis.get(POSTS_KEY);
  const posts = JSON.parse(raw);

  let updated = 0;
  for (const post of posts) {
    if (coverImages[post.slug]) {
      post.coverImage = coverImages[post.slug];
      post.updatedAt = new Date().toISOString();
      console.log(`✅ ${post.slug} → image set`);
      updated++;
    }
  }

  await redis.set(POSTS_KEY, JSON.stringify(posts));
  console.log(`\nUpdated ${updated} posts.`);
  await redis.disconnect();
  console.log("Done!");
}

main().catch(console.error);
