import { sitioConfig } from '../../../config/sitio.config';

export default function Bio() {
    return (
        <section id="bio" className="bg-marino-2 border-y border-marino-4 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-center">
                {/* Placeholder Foto */}
                <div className="w-full max-w-sm mx-auto md:w-full aspect-[3/4] bg-marino-3 border border-marino-4 relative overflow-hidden fade-up shadow-xl shadow-naranja/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 m-auto h-16 w-16 text-gris-claro opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {/* Overlay Naranja en borde inferior */}
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-naranja/20 to-transparent"></div>
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
