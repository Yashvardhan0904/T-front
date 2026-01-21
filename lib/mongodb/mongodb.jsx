import mongoose from "mongoose";
import dns from "dns";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "Yashvardhan";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI missing in .env");
}

// Log the MongoDB cluster being used (hide password)
const sanitizedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
console.log("📌 [MongoDB Config] Using cluster:", sanitizedUri);
console.log("📌 [MongoDB Config] Database name:", DB_NAME);

/**
 * FORCE DNS OVERRIDE
 * This will attempt to use Google DNS (8.8.8.8) directly within the Node process
 * to bypass ISP-level DNS blocks on .mongodb.net
 */
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log("🔒 [SMART_V3] DNS Security: Configured Google/Cloudflare DNS bypass.");
} catch (e) {
  console.warn("⚠️ [SMART_V3] Could not override DNS servers:", e.message);
}

let cachedConnection = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (cachedConnection) return cachedConnection;

  console.log("🚀 [SMART_V3] Initializing Hardened Database Connection...");

  cachedConnection = (async () => {
    try {
      mongoose.set('strictQuery', false);

      console.log("⏳ [SMART_V3] Primary Attempt (SRV)...");
      return await mongoose.connect(MONGODB_URI, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    } catch (err) {
      console.error("❌ [SMART_V3] SRV Resolution Failed:", err.message);

      if (MONGODB_URI.includes('mongodb+srv://')) {
        console.warn("⚠️ [SMART_V3] ISP Block Detected. Activating Deep Fallback...");

        try {
          const srvUrl = new URL(MONGODB_URI.replace('mongodb+srv://', 'http://'));
          const host = srvUrl.hostname;
          const parts = host.split('.');

          if (parts.length >= 3) {
            const cluster = parts[0];
            const hash = parts[1];
            const domain = parts.slice(2).join('.');

            const shards = [
              `${cluster}-shard-00-00.${hash}.${domain}:27017`,
              `${cluster}-shard-00-01.${hash}.${domain}:27017`,
              `${cluster}-shard-00-02.${hash}.${domain}:27017`,
            ];

            const password = encodeURIComponent(srvUrl.password);
            const user = encodeURIComponent(srvUrl.username);
            const fallbackUri = `mongodb://${user}:${password}@${shards.join(',')}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

            console.log("🔗 [SMART_V3] Connecting via Direct Shards...");
            return await mongoose.connect(fallbackUri, {
              dbName: DB_NAME,
              serverSelectionTimeoutMS: 15000,
            });
          }
        } catch (fallbackErr) {
          console.error("❌ [SMART_V3] Deep Fallback Failed:", fallbackErr.message);
          throw new Error("Could not connect to MongoDB. Your ISP or network is blocking the database. Please try a different Wi-Fi or Mobile Hotspot.");
        }
      }

      cachedConnection = null;
      throw err;
    }
  })();

  return cachedConnection;
}

export function isConnected() {
  return mongoose.connection.readyState === 1;
}
