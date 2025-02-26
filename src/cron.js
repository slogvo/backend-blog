const cron = require("node-cron");
const axios = require("axios");

const PING_URL = `${
  process.env.RENDER_API_URL || "https://blog-express-jf74.onrender.com"
}`;

// Chạy mỗi 10 phút để giữ server không bị sleep
cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.get(PING_URL);
    console.log(`✅ Ping success: ${response.status}`);
  } catch (error) {
    console.error(`❌ Ping failed: ${error.message}`);
  }
});

console.log("🕒 Cron job started! Running every 10 minutes...");
