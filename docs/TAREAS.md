# Tareas para Lanzamiento - IL-Campus
**Fecha objetivo:** 8 días  
**Última actualización:** 8 de Marzo 2026
---
## 🔴 PRIORIDAD ALTA - Crítico para lanzamiento
### 1. Typo en validador de ejercicio
- **Archivo:** `src/nucleo/validadores/ejercicio.validador.ts:13`
- **Problema:** `AISLAMIENT0` → debe ser `AISLAMiento`
- **Estado:** Pendiente
### 2. Validaciones Zod faltantes
Agregar esquemas Zod a las siguientes acciones:
| Acción | Archivo | Estado |
|--------|---------|--------|
| crearEjercicio | ejercicio.accion.ts | Pendiente |
| actualizarEjercicio | ejercicio.accion.ts | Pendiente |
| crearPlan | plan.accion.ts | Pendiente |
| actualizarPlan | plan.accion.ts | Pendiente |
| crearRutina | rutina.accion.ts | Pendiente |
| actualizarRutina | rutina.accion.ts | Pendiente |
### 3. Gamificación con persistencia
- **Problema:** Solo funciona client-side (Zustand), se pierde al limpiar cache
- **Solución:** Sincronizar con base de datos
- **Estado:** Pendiente
### 4. Rate limiting persistente
- **Problema:** El Map en memoria se reinicia en cada request serverless
- **Solución:** Considerar Redis o externalizar
- **Estado:** Pendiente (investigación)
---
## 🟡 PRIORIDAD MEDIA - Mejoras importantes
### 1. Ciclo menstrual - UI incompleta
- **Estado:** Modelo BD existe, pero no hay UI para configurarlo
- **Estado:** Pendiente
### 2. Testeo de fuerza - UI incompleta
- **Estado:** Modelos BD existen, UI incompleta
- **Estado:** Pendiente
### 3. Manejo de errores inconsistente
- **Problema:** Diferentes mensajes de error en distintas partes de la app
- **Estado:** Pendiente
### 4. Loading states faltantes
- **Problema:** Páginas sin skeleton/spinner durante carga
- **Estado:** Pendiente
### 5. Empty states faltantes
- **Problema:** Listas vacías sin mensaje instructivo
- **Estado:** Pendiente
---
## 🟢 PRIORIDAD BAJA
- Documentación de variables de entorno
- Más tests de integración
- Optimización de rendimiento
- PWA para offline
---
## ✅ Verificado - Funcionando correctamente
- Arquitectura limpia (separación nucleo/compartido)
- Seguridad: JWT, MFA, rate limiting, headers CSP
- Autenticación robusta
- Documentación existente completa
- 22 tests pasando
---
## Plan sugerido para 8 días
| Día | Tarea |
|-----|-------|
| 1-2 | Corregir typo + validaciones Zod |
| 3-4 | Gamificación con BD |
| 5-6 | Completar ciclo menstrual + testeo |
| 7 | UX (loading, errores, empty states) |
| 8 | QA final + deployment |