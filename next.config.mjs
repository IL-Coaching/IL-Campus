/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                pathname: '/vi/**',
            },
            {
                protocol: 'https',
                hostname: 'rybdfdlxpsruyznzekoj.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    async redirects() {
        return [
            { source: '/entrenador/configuracion', destination: '/entrenador/cuenta', permanent: true },
            { source: '/entrenador/checkins', destination: '/entrenador/mensajeria', permanent: true },
            { source: '/entrenador/mensajes', destination: '/entrenador/mensajeria', permanent: true }
        ];
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
        ];
    }
};

export default nextConfig;
