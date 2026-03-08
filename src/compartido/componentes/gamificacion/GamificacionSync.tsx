"use client";

import { useEffect } from "react";
import { useGamificacionStore } from "@/compartido/infraestructura/gamificacion.store";

export function GamificacionSync() {
    const hidratarDesdeDB = useGamificacionStore(state => state.hidratarDesdeDB);
    const dbSynced = useGamificacionStore(state => state.dbSynced);

    useEffect(() => {
        if (!dbSynced) {
            hidratarDesdeDB();
        }
    }, [dbSynced, hidratarDesdeDB]);

    return null; // Componente invisible, solo maneja lógica de hidratación
}
