/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" }
    ],
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "dezire-next.vercel.app" }], destination: "https://heaven-bd.vercel.app/:path*", permanent: false }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
          { key: "Content-Security-Policy-Report-Only", value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com",
            "font-src 'self' data:",
            "connect-src 'self' https://api.github.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net",
            "media-src 'self' https://res.cloudinary.com",
            "form-action 'self'",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "object-src 'none'"
          ].join("; ") }
        ]
      }
    ]
  }
}

module.exports = nextConfig
