import Link from 'next/link';
import Image from 'next/image';
import { sitioConfig } from '../../../config/sitio.config';

interface Props {
    imageUrl?: string | null;
    titulo?: string | null;
    subtitulo?: string | null;
}

export default function Hero({ imageUrl, titulo, subtitulo }: Props) {

    return (
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
            {/* Radial Glow Setup */}
            <div className="absolute top-1/4 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-naranja/5 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

            {/* Columna Izquierda */}
            <div className="z-10 fade-up order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-naranja/10 border border-naranja/30 mb-8">
                    <div className="w-2 h-2 rounded-full bg-naranja animate-pulse"></div>
                    <span className="text-blanco text-[0.7rem] font-bold uppercase tracking-widest leading-none mt-0.5">Asesorías online · {sitioConfig.ubicacion}</span>
                </div>

                <h1 className="text-5xl sm:text-[clamp(2.8rem,5vw,4.5rem)] font-barlow-condensed font-black uppercase text-blanco leading-[0.95] mb-6 tracking-tight">
                    {titulo ? titulo.split('\n').map((line, i) => (
                        <span key={i} className={i >= 2 ? "text-naranja" : ""}>
                            {line}<br />
                        </span>
                    )) : (
                        <>
                            Más que<br />entrenar:<br />
                            <span className="text-naranja">ENTENDER,</span><br />
                            <span className="text-naranja">ADAPTAR,</span><br />
                            <span className="text-naranja">PROGRESAR.</span>
                        </>
                    )}
                </h1>

                <p className="text-gris-claro font-light text-lg sm:text-xl max-w-lg mb-10 leading-relaxed whitespace-pre-wrap">
                    {subtitulo || "Asesorías de entrenamiento 100% personalizadas basadas en ciencia."}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <Link
                        href="/#planes"
                        className="w-full sm:w-auto bg-naranja text-marino font-bold px-8 py-4 rounded focus:outline-none hover:bg-naranja-h transition-colors text-center shadow-lg shadow-naranja/20"
                    >
                        Ver planes →
                    </Link>
                    <Link
                        href="/#bio"
                        className="text-blanco font-medium border-b border-naranja/30 hover:border-naranja transition-colors pb-1 text-sm uppercase tracking-wide"
                    >
                        Conocé al entrenador
                    </Link>
                </div>
            </div>

            {/* Columna Derecha */}
            <div className="relative fade-up order-1 md:order-2 w-full max-w-sm mx-auto md:max-w-none group">
                {/* Glow decorativo detrás de la foto */}
                <div className="absolute inset-0 bg-naranja/10 blur-[80px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>

                {/* Contenedor de la foto */}
                <div className="relative w-full aspect-[380/480] bg-marino-2 border border-marino-4 rounded-2xl flex flex-col items-center justify-center text-gris-claro overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-naranja/30 group-hover:shadow-naranja/5">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={sitioConfig.entrenador}
                            fill
                            className="object-cover object-top"
                            priority
                            quality={90}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <>
                            {/* Patrón de puntos decorativos */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 opacity-20 group-hover:opacity-40 transition-opacity duration-500 text-naranja" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-barlow-condensed font-black tracking-[0.3em] uppercase opacity-40 text-[0.6rem] group-hover:opacity-60 transition-opacity">Espacio para fotografía</span>
                        </>
                    )}

                    {/* Overlay gradiente inferior */}
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-marino-2 to-transparent group-hover:from-naranja/10 transition-colors duration-700"></div>
                </div>

                {/* Stats flotantes */}
                <div className="absolute hidden lg:flex -bottom-6 -left-6 md:-bottom-8 md:-left-8 flex-col gap-4">
                    <div className="bg-marino-2 border border-marino-4 p-4 shadow-xl flex items-center gap-4">
                        <span className="text-4xl font-barlow-condensed font-black text-naranja leading-none">100%</span>
                        <span className="text-xs text-gris font-bold tracking-[0.1em] uppercase leading-tight font-barlow-condensed">Personalizado</span>
                    </div>
                    <div className="bg-marino-2 border border-marino-4 p-4 shadow-xl flex items-center gap-4 ml-8">
                        <span className="text-4xl font-barlow-condensed font-black text-naranja leading-none">+3</span>
                        <span className="text-xs text-gris font-bold tracking-[0.1em] uppercase leading-tight font-barlow-condensed">Planes<br />disponibles</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
