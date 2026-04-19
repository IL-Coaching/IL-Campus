import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Middleware de Seguridad — IL-Campus
 *
 * Funciones:
 * - Rate Limiting persistente via Supabase REST (funciona en Edge + múltiples instancias Vercel)
 * - Headers de seguridad (CSP, HSTS, X-Frame-Options)
 * - Protección de rutas autenticadas con verificación real de JWT (HMAC-SHA256)
 * - Redirección de usuarios no autenticados
 */

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
        ? (() => { throw new Error("JWT_SECRET no configurado en variables de entorno"); })()
        : 'dev-secret-please-change-in-production')
);

const RATE_LIMIT_VENTANA_MIN = 15;
const RATE_LIMIT_MAX_INTENTOS = 20;

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
    '/alumno/mensajeria',
    '/alumno/progreso',
    '/alumno/membresia',
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

const RUTAS_LOGIN = [
    '/entrenador/login',
    '/alumno/login',
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

function esRutaLogin(pathname: string): boolean {
    return RUTAS_LOGIN.some(ruta => pathname.startsWith(ruta));
}

function getClientIp(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}

/**
 * Rate limiting persistente usando la tabla RegistroAutenticacion en Supabase.
 * Compatible con Edge Runtime — usa fetch directo a la API REST de Supabase.
 * Funciona correctamente en entornos serverless/multi-instancia como Vercel.
 */
async function checkRateLimitPersistente(ip: string): Promise<boolean> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) return true;

    const ahora = new Date();
    const ventana = new Date(ahora.getTime() - RATE_LIMIT_VENTANA_MIN * 60 * 1000);
    const bloqueadoHasta = new Date(ahora.getTime() + RATE_LIMIT_VENTANA_MIN * 60 * 1000);

    try {
        const getBuscar = await fetch(
            `${supabaseUrl}/rest/v1/RegistroAutenticacion?ip=eq.${encodeURIComponent(ip)}&select=id,intentos,bloqueadoHasta,ultimoIntento`,
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const registros = await getBuscar.json();
        const registro = registros?.[0];

        if (!registro) {
            await fetch(`${supabaseUrl}/rest/v1/RegistroAutenticacion`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({ ip, intentos: 1, ultimoIntento: ahora.toISOString() })
            });
            return true;
        }

        if (registro.bloqueadoHasta && new Date(registro.bloqueadoHasta) > ahora) {
            return false;
        }

        if (new Date(registro.ultimoIntento) < ventana) {
            await fetch(`${supabaseUrl}/rest/v1/RegistroAutenticacion?ip=eq.${encodeURIComponent(ip)}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({ intentos: 1, bloqueadoHasta: null, ultimoIntento: ahora.toISOString() })
            });
            return true;
        }

        const nuevosIntentos = registro.intentos + 1;
        const superaLimite = nuevosIntentos >= RATE_LIMIT_MAX_INTENTOS;

        await fetch(`${supabaseUrl}/rest/v1/RegistroAutenticacion?ip=eq.${encodeURIComponent(ip)}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                intentos: nuevosIntentos,
                ultimoIntento: ahora.toISOString(),
                ...(superaLimite ? { bloqueadoHasta: bloqueadoHasta.toISOString() } : {})
            })
        });

        return !superaLimite;

    } catch {
        return true;
    }
}

function getTokenFromCookies(request: NextRequest): string | null {
    const sessionCookie = request.cookies.get('session_token');
    return sessionCookie?.value || null;
}

async function verificarToken(token: string): Promise<{ role?: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { role?: string };
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (esRutaPublica(pathname)) {
        return applySecurityHeaders(NextResponse.next());
    }

    if (esRutaLogin(pathname)) {
        const ip = getClientIp(request);
        const permitido = await checkRateLimitPersistente(ip);
        if (!permitido) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'Retry-After': String(RATE_LIMIT_VENTANA_MIN * 60),
                },
            });
        }
    }

    const token = getTokenFromCookies(request);

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
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
