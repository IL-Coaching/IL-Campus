# 📓 Bitácora de Proyecto: IL-Campus

## 1. Génesis y Propósito
**IL-Campus** no es solo un software de gestión; es el ecosistema digital de **IL-Coaching**. Surge de la necesidad de profesionalizar la relación entre el entrenador y el alumno, eliminando las barreras de las herramientas genéricas (Excels estáticos, mensajes perdidos, PDFs pesados) para ofrecer un servicio de **alto rendimiento personalizado**.

### Historia y Visión:
El proyecto nace de la transición de un entrenamiento "artesanal" basado en el conocimiento empírico hacia una infraestructura digital que **amplifica** ese conocimiento. El objetivo es que la tecnología trabaje para el profesional, permitiéndole dedicar más tiempo a lo que realmente importa: **la intervención humana y el ajuste técnico.**

## 2. Fundamentos y Filosofía (Misión)
La metodología de IL-Campus se basa en tres pilares innegociables que definen su arquitectura:

- **Adaptabilidad 100% (El Entrenador como Artesano)**: El software es una caja de herramientas, no un chaleco de fuerza. El sistema permite al profesional ajustar cada detalle (series, ejercicios libres, notas clínicas) para adaptarse a las necesidades cambiantes del cliente de forma fluida.
- **Entender, Adaptar, Progresar**: No se entregan rutinas, se gestionan procesos. La plataforma educa al alumno mediante feedback técnico y datos medibles (RIR, RM, Fatiga) para garantizar una progresión real basada en ciencia.
- **Evidencia Científica Aplicada**: La arquitectura incorpora herramientas de cálculo avanzadas (Brzycki, zonas de intensidad, testeo directo/indirecto) para que cada decisión del entrenador esté respaldada por datos.

## 3. Arquitectura del Sistema
La arquitectura de IL-Campus sigue un patrón de **Separación de Preocupaciones (SoC)** diseñado para la velocidad y la seguridad:

- **El Núcleo (`src/nucleo/`)**: Contiene el "cerebro" de la aplicación. Aquí reside la lógica de negocio, las acciones del servidor (Server Actions) y los tipos de datos, protegidos de la infraestructura externa.
- **Frontend de Alto Impacto**: Construido sobre **Next.js 14**, utiliza el App Router para una navegación instantánea y una estética premium que transmite profesionalismo desde el primer contacto (Landing Page).
- **Persistencia y Seguridad**: 
  - **Prisma + PostgreSQL (Supabase)**: Garantiza la integridad de los datos de planificación y finanzas.
  - **ArchSecure AI**: El código sigue auditorías de seguridad constantes para proteger la privacidad de los alumnos y la propiedad intelectual del entrenador.

## 4. Pila Tecnológica (Tech Stack)
- **Framework:** Next.js 14 (App Router, Server Actions).
- **Lenguaje:** TypeScript (Node.js 20.x).
- **Base de Datos:** PostgreSQL con Prisma ORM.
- **Auth & Storage:** Supabase (JWT verificado en Edge Runtime).
- **UI/UX:** Tailwind CSS, Lucide React, Radix UI.
- **Análisis:** Recharts para métricas de progreso de alumnos.

## 5. Estado del Pipeline (ArchSecure AI v4.0)
- **Fase 1 a 3 (Base Técnica):** ✅ Completadas.
- **Seguridad (OWASP + Auth):** ✅ Auditado y Parchado.
- **Fase 4 (Adaptación Móvil & UX):** ✅ Finalizada. 
  - Se garantiza un entorno 100% responsive, eliminando scrolls laterales y optimizando el uso táctil en gimnasios.

---
*Este documento es la fuente de verdad sobre la identidad de IL-Campus, validado bajo el marco de trabajo de IL-Coaching.*
