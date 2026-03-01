-- ============================================
-- HABILITAR REALTIME PARA MENSAJES
-- ============================================
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Habilitar realtime en la tabla mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;

-- 2. Verificar que está habilitado
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- NOTA IMPORTANTE:
-- ============================================
-- Si la tabla NO aparece en la lista, ejecutar:
-- CREATE PUBLICATION supabase_realtime FOR TABLE mensajes;
