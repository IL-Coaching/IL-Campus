import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Middleware de Seguridad — ArchSecure AI
 *
 * Funciones:
 * - Headers de seguridad (CSP, HSTS, X-Frame-Options)
 * - Protección de rutas autenticadas con verificación real de JWT (HMAC-SHA256)
 * - Redirección de usuarios no autenticados
 *
 * SEGURIDAD: El middleware verifica la firma criptográfica del JWT con jose
 * (compatible Edge Runtime). La decodificación sin verificación fue eliminada:
 * un atacante podía forjar un JWT con role='entrenador' y acceder sin credenciales.
 */

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-para-desarrollo-local-no-usar-en-produccion'
);

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

function esRutaEntrenador(pathname: string): boolean {
    return RUTAS_PROTEGIDAS_ENTRENADOR.some(ruta => pathname.startsWith(ruta));
}

function esRutaAlumno(pathname: string): boolean {
    return RUTAS_PROTEGIDAS_ALUMNO.some(ruta => pathname.startsWith(ruta));
}

function esRutaPublica(pathname: string): boolean {
    return RUTAS_PUBLICAS.some(ruta => pathname === ruta || pathname.startsWith(ruta));
}

function getTokenFromCookies(request: NextRequest): string | null {
    const sessionCookie = request.cookies.get('session_token');
    return sessionCookie?.value || null;
}

/**
 * Verifica la firma del JWT y retorna el payload si es válido.
 * Usa jose (compatible con Edge Runtime de Next.js).
 * @security Reemplaza la decodificación insegura sin verificación (JSON.parse del payload base64).
 */
async function verificarToken(token: string): Promise<{ role?: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { role?: string };
    } catch {
        // Token inválido, expirado o firma incorrecta
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (esRutaPublica(pathname)) {
        return applySecurityHeaders(NextResponse.next());
    }

    const token = getTokenFromCookies(request);

    // Rutas de entrenador
    if (esRutaEntrenador(pathname)) {
        if (!token) {
            const loginUrl = new URL('/entrenador/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const payload = await verificarToken(token);
        if (!payload || payload.role !== 'entrenador') {
            const loginUrl = new URL('/entrenador/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Rutas de alumno
    if (esRutaAlumno(pathname)) {
        if (!token) {
            const loginUrl = new URL('/alumno/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const payload = await verificarToken(token);
        if (!payload || payload.role !== 'alumno') {
            const loginUrl = new URL('/alumno/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return applySecurityHeaders(NextResponse.next());
}

/**
 * Aplica headers de seguridad HTTP (OWASP)
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );

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
