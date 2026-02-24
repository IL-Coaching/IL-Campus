import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Seguridad — ArchSecure AI
 * 
 * Funciones:
 * - Headers de seguridad (CSP, HSTS, X-Frame-Options)
 * - Protección de rutas autenticadas
 * - Redirección de usuarios no autenticados
 */

const RUTAS_PROTEGIDAS_ENTRENADOR = [
    '/entrenador/dashboard',
    '/entrenador/clientes',
    '/entrenador/biblioteca',
    '/entrenador/finanzas',
    '/entrenador/checkins',
    '/entrenador/mensajes',
];

const RUTAS_PROTEGIDAS_ALUMNO = [
    '/alumno/dashboard',
    '/alumno/rutina',
    '/alumno/checkin',
    '/alumno/perfil',
];

const RUTAS_PUBLICAS = [
    '/',
    '/ingresar',
    '/inscripcion',
    '/recuperar',
    '/api',
    '/_next',
    '/favicon.ico',
];

/**
 * Verifica si la ruta requiere autenticación de entrenador
 */
function esRutaEntrenador(pathname: string): boolean {
    return RUTAS_PROTEGIDAS_ENTRENADOR.some(ruta => pathname.startsWith(ruta));
}

/**
 * Verifica si la ruta requiere autenticación de alumno
 */
function esRutaAlumno(pathname: string): boolean {
    return RUTAS_PROTEGIDAS_ALUMNO.some(ruta => pathname.startsWith(ruta));
}

/**
 * Verifica si la ruta es pública (no requiere autenticación)
 */
function esRutaPublica(pathname: string): boolean {
    return RUTAS_PUBLICAS.some(ruta => pathname === ruta || pathname.startsWith(ruta));
}

/**
 * Extrae el token de la cookie de sesión
 */
function getTokenFromCookies(request: NextRequest): string | null {
    const sessionCookie = request.cookies.get('session_token');
    return sessionCookie?.value || null;
}

/**
 * Decodifica el payload del JWT (sin verificación - solo para routing)
 */
function decodeTokenPayload(token: string): { role?: string } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Si es ruta pública, permitir y aplicar headers
    if (esRutaPublica(pathname)) {
        return applySecurityHeaders(NextResponse.next());
    }

    // Verificar sesión
    const token = getTokenFromCookies(request);
    
    // Redirección para rutas de entrenador
    if (esRutaEntrenador(pathname)) {
        if (!token) {
            const loginUrl = new URL('/entrenador/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const payload = decodeTokenPayload(token);
        if (!payload || payload.role !== 'entrenador') {
            const loginUrl = new URL('/entrenador/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirección para rutas de alumno
    if (esRutaAlumno(pathname)) {
        if (!token) {
            const loginUrl = new URL('/alumno/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const payload = decodeTokenPayload(token);
        if (!payload || payload.role !== 'alumno') {
            const loginUrl = new URL('/alumno/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return applySecurityHeaders(NextResponse.next());
}

/**
 * Aplica headers de seguridad HTTP
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
    // Headers de seguridad básicos - OWASP
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy (básico - ajustar según necesidad)
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );

    // HSTS (solo en producción)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
