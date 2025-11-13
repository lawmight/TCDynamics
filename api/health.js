/**
 * Health Check Endpoint
 * Simple endpoint to verify API is running
 * Use this before deploys or to monitor uptime
 */
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    version: "1.0.0",
    uptime: process.uptime(), // Seconds since process started
  });
}
