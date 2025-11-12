/**
 * Simple test endpoint to verify Vercel serverless functions are working
 */

export default async function handler(req, res) {
  try {
    // Check environment variables
    const hasSupabaseUrl = !!process.env.SUPABASE_URL;
    const hasSupabaseAnonKey = !!process.env.SUPABASE_ANON_KEY;
    const hasSupabaseServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
    const hasResendKey = !!process.env.RESEND_API_KEY;

    return res.status(200).json({
      success: true,
      message: 'Test endpoint working!',
      environment: {
        nodeVersion: process.version,
        hasSupabaseUrl,
        hasSupabaseAnonKey,
        hasSupabaseServiceKey,
        hasResendKey,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
