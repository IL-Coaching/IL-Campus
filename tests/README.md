# Tests — IL-Campus

## Estructura

```
/tests
├── /unitarios        # Tests de funciones y servicios individuales
├── /integracion      # Tests de flujos entre módulos
├── /seguridad        # Tests de autenticación, autorización, validación
└── /e2e             # Tests end-to-end de flujos principales
```

## Ejecución

```bash
# Unitarios
npm run test:unit

# Integración
npm run test:integracion

# Seguridad
npm run test:seguridad

# Todos
npm run test
```

## Convenciones

- Nombre: `[modulo].test.ts`
- Ubicación: junto al módulo que testean
- Cobertura mínima: lógica de negocio crítica
