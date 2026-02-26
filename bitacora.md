# Bitácora del Proyecto: IL-Campus

## 1. Contexto del Proyecto
**IL-Campus** es una plataforma integral desarrollada para la organización "IL-Coaching". 
Su objetivo principal es gestionar la administración operativa y deportiva de entrenadores y clientes (alumnos).

### Funcionalidades Clave:
- **Gestión de Entrenamientos:** Creación y asignación de mesociclos y sesiones de entrenamiento.
- **Biblioteca de Ejercicios:** Un catálogo de ejercicios personalizable con soporte para texto libre, enlaces a videos y reordenamiento intuitivo mediante Drag & Drop.
- **Gestión de Clientes:** Rastreo del estado de los alumnos (e.g. activos vs en "estasis" o pausa).
- **Módulo de Finanzas:** Control de pagos, vencimientos y vinculación con la cuenta del cliente para mostrar estados ("Al día" o "Vencido").
- **Manejo de Acceso y Seguridad:** Generación de códigos de activación robustos y sesiones seguras para los usuarios.

## 2. Pila Tecnológica (Tech Stack)
La aplicación está construida con un ecosistema moderno de JavaScript/TypeScript, priorizando el rendimiento y el despliegue Serverless/Edge:

- **Framework Principal:** [Next.js 14](https://nextjs.org/) (usando el App Router y Server Actions).
- **Lenguaje:** TypeScript (ejecutándose bajo Node.js 20.x).
- **Base de Datos:** PostgreSQL gestionado a través de [Prisma ORM](https://www.prisma.io/) (`@prisma/client` v5.22.0).
- **Backend as a Service / Auth:** [Supabase](https://supabase.com/).
- **Estilos e Interfaz:** [Tailwind CSS](https://tailwindcss.com/) junto con componentes UI de Radix (`@radix-ui/react-tabs`) y Lucide React para iconografía.
- **Seguridad y Criptografía:** 
  - Manejo de contraseñas con `bcryptjs`.
  - Verificación de JSON Web Tokens (JWT) compatible con Edge Runtime usando `jose`.
  - Generación segura de tokens mediante la Web Crypto API (`crypto.getRandomValues()`).
- **Otras Librerías Relevantes:** `zod` para validación de esquemas, `recharts` para gráficos, `resend` para envío de correos, `date-fns` para manipulación de fechas, y utilidades para PDFs (`html2pdf.js`) y QR (`qrcode`).

## 3. Arquitectura y Estructura
La logica de negocio y el dominio están separados de la infraestructura de Next.js, encapsulados primariamente bajo el directorio `src/nucleo/`. Se enfatiza:
- Validar reglas y lógica de negocio estrictamente en el backend mediante Server Actions.
- Evitar pasar datos sensibles en las URLs de rutas públicas.
- Estabilidad para los despliegues en infraestructura de **Vercel**.

## 4. Estado Actual del Pipeline (Tool Box - ArchSecure AI v4.0)
- **Fase 1 a 3:** Completadas (Arquitectura base, Biblioteca de Ejercicios, Gestión de Clientes y Finanzas).
- **Seguridad & Calidad:** Auditoría OWASP aplicada, validación Zod en flujos de auth, mitigación de fuerza bruta y eliminación de secrets hardcoded.
- **Fase 4 (Adaptación Móvil & UX):** **Finalizada**. 
  - Refinamiento de `VistaSesion.tsx` con tarjetas adaptativas para el entrenador.
  - Optimización del Formulario de Inscripción con navegación pegajosa (sticky) y layout Mobile-First.
  - Auditoría de flujos críticos en pantallas < 400px.

*(Este documento actúa como resumen técnico de IL-Campus, validado bajo el marco ArchSecure AI v4.0).*
