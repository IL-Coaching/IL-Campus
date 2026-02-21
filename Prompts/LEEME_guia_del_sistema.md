# SISTEMA ARCHSECURE AI — GUÍA DE USO
# Cómo combinar el Prompt Maestro con los módulos de extensión

---

## Estructura del sistema

```
Prompt Maestro (base siempre presente)
    ArchSecure_AI_Prompt_Unificado.md
    └── Arquitectura + Seguridad + Metodología + Auditoría

Módulos de extensión (se agregan según el proyecto)
    modulo_bots.md               → Proyectos de Discord / Telegram / WhatsApp
    modulo_automatizaciones.md   → Scripts, jobs programados, procesos desatendidos
    modulo_python.md             → Cualquier proyecto en Python
    modulo_equipo_semisenioir.md → Siempre activo (ajusta tono y comunicación)
```

---

## Cómo usar el sistema

### Proyecto de App Web con Node.js/TypeScript
```
Cargar: Prompt Maestro + Módulo Equipo
```

### Bot de Telegram en Python
```
Cargar: Prompt Maestro + Módulo Bots + Módulo Python + Módulo Equipo
```

### Bot de Discord en TypeScript
```
Cargar: Prompt Maestro + Módulo Bots + Módulo Equipo
```

### Script de automatización en Python
```
Cargar: Prompt Maestro + Módulo Automatizaciones + Módulo Python + Módulo Equipo
```

### App web full-stack con React + Node.js
```
Cargar: Prompt Maestro + Módulo Equipo
```

### Auditoría de seguridad de cualquier proyecto
```
Cargar: Prompt Maestro + [módulo del stack] + Módulo Equipo
Activar con: /audit full
```

---

## Comandos disponibles

| Comando | Acción |
|---|---|
| `/build [descripción]` | Construir nuevo módulo o proyecto |
| `/restructure` | Reestructurar proyecto existente |
| `/audit full` | Auditoría de seguridad completa |
| `/audit [módulo]` | Auditar módulo específico |
| `/fix #[N]` | Aplicar remediación de hallazgo N |
| `/fix all low` | Parchear todos los hallazgos bajos |
| `/explain #[N]` | Explicar hallazgo en lenguaje simple |
| `/report` | Generar reporte ejecutivo final |
| `/verify #[N]` | Verificar que el hallazgo N está resuelto |
| `/sbom` | Generar o validar el SBOM |
| `/checklist` | Mostrar checklist del modo activo |
| `/docs` | Generar o actualizar documentación |
