import { sitioConfig } from '../../../config/sitio.config';

export default function Bio() {
    return (
        <section id="bio" className="bg-marino-2 border-y border-marino-4 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-center">
                {/* Placeholder Foto */}
                <div className="w-full max-w-sm mx-auto md:w-full aspect-[3/4] bg-marino-3 border border-marino-4 rounded-2xl relative overflow-hidden fade-up shadow-2xl group">
                    {/* Patrón de puntos decorativos */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 m-auto h-20 w-20 text-naranja opacity-10 group-hover:opacity-30 transition-opacity duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>

                    {/* Overlay Naranja en borde inferior */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-naranja/10 to-transparent"></div>
                </div>

                {/* Info */}
                <div className="fade-up">
                    <span className="text-naranja font-barlow-condensed font-bold tracking-[0.15em] text-xs uppercase block mb-4">
                        Sobre el entrenador
                    </span>
                    <h2 className="text-[2.5rem] font-barlow-condensed font-black uppercase text-blanco mb-1 leading-none tracking-tight">
                        {sitioConfig.entrenador}
                    </h2>
                    <p className="text-naranja text-xs tracking-widest uppercase font-bold mb-8">
                        Fitness Coach · {sitioConfig.nombre}
                    </p>

                    <p className="text-gris-claro font-light leading-relaxed mb-8 text-lg">
                        Transformo la salud, el rendimiento y la calidad de vida de las personas mediante sistemas de entrenamiento personalizados, basados en evidencia científica y adaptados a la vida real. Mi enfoque: procesos personalizados, cálidos, medibles y sostenibles.
                    </p>

                    <ul className="space-y-4">
                        {[
                            "Especialista en musculación, funcional training y calistenia",
                            "Instructor de Musculación y Especialista en Hipertrofia",
                            "Instructor Personal Trainer y Musculación",
                            "Instructor de Karate",
                            "Curso Sueño y Rendimiento",
                            "Curso de Signos Vitales"
                        ].map((cert, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-naranja mt-1 text-sm leading-none">■</span>
                                <span className="text-blanco font-medium text-sm md:text-base">{cert}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
