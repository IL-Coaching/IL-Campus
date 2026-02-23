import { createClient } from '@supabase/supabase-js';

/**
 * Cliente centralizado de Supabase para operaciones de servidor.
 * Utiliza la Service Role Key para bypass de RLS en operaciones administrativas.
 * @security Se utiliza solo en el lado del servidor para no exponer la clave maestra.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Advertencia: Supabase URL o Service Role Key no detectadas en variables de entorno.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
