import AlumnoNav from "@/compartido/componentes/AlumnoNav";
import { getAlumnoSesion } from "@/nucleo/seguridad/sesion";
import { prisma } from "@/baseDatos/conexion";
import PerfilContent from "./PerfilContent";

export default async function PerfilPage() {
    const alumno = await getAlumnoSesion();

    // Obtener configuración de ciclo si existe
    const ciclo = await prisma.cicloMenstrual.findUnique({
        where: { clienteId: alumno.id }
    });

    return (
        <div className="min-h-screen bg-marino pb-32 text-blanco">
            <header className="p-8 pt-12 text-center bg-gradient-to-b from-marino-2 to-marino border-b border-marino-4">
                <div className="w-20 h-20 bg-naranja/10 text-naranja border-2 border-naranja/30 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-naranja/10">
                    <span className="text-3xl font-black font-barlow-condensed">
                        {alumno.nombre.split(' ').map((n: any) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                </div>
                <h1 className="text-4xl font-barlow-condensed font-black uppercase text-blanco tracking-tight italic">Panel de Usuario</h1>
                <p className="text-gris text-xs font-bold uppercase tracking-[0.3em] mt-2">Configuración Centralizada</p>
            </header>

            <main className="max-w-xl mx-auto p-6">
                <PerfilContent alumno={alumno} ciclo={ciclo} />
            </main>

            <AlumnoNav />
        </div>
    );
}
