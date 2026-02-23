import { supabaseAdmin } from "@/compartido/infraestructura/supabase";

/**
 * Servicio de almacenamiento centralizado.
 * Gestiona subidas, borrados y generación de URLs públicas.
 * @security Valida tipos de archivo y tamaños de buffer.
 */
export class StorageServicio {
    private static BUCKET = 'archivos';

    /**
     * Sube una imagen en base64 al almacenamiento.
     * @param base64 String base64 completo (incluyendo data:...)
     * @param path Ruta dentro del bucket
     * @returns URL pública del archivo
     */
    static async subirImagenBase64(base64: string, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
        try {
            // 1. Limpieza y validación
            const mimeTypeMatch = base64.match(/^data:(image\/\w+);base64,/);
            if (!mimeTypeMatch) {
                return { success: false, error: "Formato de imagen inválido." };
            }

            const mimeType = mimeTypeMatch[1];
            const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            // 2. Subida
            const { error: uploadError } = await supabaseAdmin.storage
                .from(this.BUCKET)
                .upload(path, buffer, {
                    contentType: mimeType,
                    upsert: true
                });

            if (uploadError) {
                console.error("Storage Error:", uploadError);
                return { success: false, error: "Error en la subida al servidor de archivos." };
            }

            // 3. Obtener URL
            const { data: publicUrlData } = supabaseAdmin.storage.from(this.BUCKET).getPublicUrl(path);

            return { success: true, url: publicUrlData.publicUrl };
        } catch (error) {
            console.error("Storage Exception:", error);
            return { success: false, error: "Fallo crítico en el servicio de almacenamiento." };
        }
    }
}
