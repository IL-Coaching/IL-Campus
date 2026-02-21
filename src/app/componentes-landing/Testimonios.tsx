export default function Testimonios() {
    const testimonios = [
        {
            iniciales: "MV",
            nombre: "Martín V.",
            plan: "GYMRAT · 3 MESES",
            texto: "Desde que empecé con IL-Coaching cambié mi forma de entender el entrenamiento. Ahora sé por qué hago cada ejercicio y el progreso es visible."
        },
        {
            iniciales: "LG",
            nombre: "Laura G.",
            plan: "ELITE · 1 AÑO",
            texto: "La planificación por mesociclos es un antes y un después. Nunca había logrado ser tan constante y medir mis avances con tanta claridad."
        },
        {
            iniciales: "FA",
            nombre: "Franco A.",
            plan: "START · 1 MES",
            texto: "Increíble la calidad del seguimiento. Las videollamadas semanales me ayudan a ajustar la técnica y mantener la motivación a tope."
        },
    ];

    return (
        <section id="testimonios" className="bg-marino-2 border-t border-marino-4 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16 text-center fade-up">
                    <span className="text-naranja font-barlow-condensed font-bold tracking-[0.15em] text-xs uppercase block mb-2">
                        Resultados
                    </span>
                    <h2 className="text-[2.5rem] font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                        Lo que dicen<br className="md:hidden" /> los entrenados
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonios.map((t, i) => (
                        <div key={i} className="bg-marino-3 border border-marino-4 p-8 flex flex-col fade-up">
                            {/* Estrellas */}
                            <div className="flex gap-1 mb-6 text-naranja text-xl">
                                ★★★★★
                            </div>

                            {/* Texto */}
                            <p className="text-gris-claro font-light italic leading-relaxed mb-8 flex-grow">
                                &quot;{t.texto}&quot;
                            </p>

                            {/* Separador */}
                            <div className="border-t border-marino-4 pt-6 flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-marino-4 flex items-center justify-center text-naranja font-barlow-condensed font-black text-lg">
                                    {t.iniciales}
                                </div>
                                {/* Info */}
                                <div>
                                    <h4 className="text-blanco font-bold leading-none mb-1">{t.nombre}</h4>
                                    <span className="text-gris text-[0.65rem] font-bold tracking-[0.15em] uppercase">{t.plan}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
