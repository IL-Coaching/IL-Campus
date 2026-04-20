interface FaqItem {
    q: string;
    a: string;
}

interface Props {
    faqsData?: FaqItem[] | null;
}

export default function Faq({ faqsData }: Props) {
    const preguntasDefault = [
        {
            q: "¿Cómo funciona el proceso de inscripción?",
            a: "Elegís el plan, nos contactamos por WhatsApp para coordinar el pago. Confirmado el pago, te envío acceso a IL-Campus donde completás tu formulario inicial para diseñar tu programa personalizado."
        },
        {
            q: "¿Necesito tener experiencia previa en el gimnasio?",
            a: "No. El programa se diseña completamente adaptado a tu nivel actual, desde cero o con años de entrenamiento."
        },
        {
            q: "¿Puedo entrenar en casa o necesito ir al gimnasio?",
            a: "Podés entrenar donde quieras. El programa se adapta al equipamiento disponible que informás en el formulario inicial."
        },
        {
            q: "¿En qué se diferencia el plan GymRat del Start?",
            a: "Todos los planes incluyen el mismo nivel de atención. La diferencia está en la profundidad de planificación: el Start es mensual, el GymRat incorpora periodización por mesociclo para una progresión más estructurada en 3 meses."
        },
        {
            q: "¿Cómo se realizan los pagos?",
            a: "Los pagos se coordinan directamente por WhatsApp. Podés transferir o usar el método que te resulte más cómodo."
        }
    ];

    const preguntas = Array.isArray(faqsData) && faqsData.length > 0 ? faqsData.map(f => ({ q: f.pregunta || f.q, a: f.respuesta || f.a })) : preguntasDefault;

    return (
        <section id="faq" className="bg-marino border-t border-marino-4 py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-16 text-center fade-up">
                    <span className="text-naranja font-barlow-condensed font-bold tracking-[0.15em] text-xs uppercase block mb-2">
                        Preguntas frecuentes
                    </span>
                    <h2 className="text-[2.5rem] font-barlow-condensed font-black uppercase text-blanco leading-none tracking-tight">
                        ¿Tenés dudas?
                    </h2>
                </div>

                {/* Lista */}
                <div className="space-y-1 fade-up">
                    {preguntas.map((item, i) => (
                        <details key={i} className="group border-b border-marino-4 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 py-6 text-blanco hover:text-naranja transition-colors">
                                <h3 className="font-barlow-condensed font-bold uppercase tracking-wide text-lg sm:text-xl">
                                    {item.q}
                                </h3>

                                <span className="relative w-5 h-5 flex-shrink-0 text-naranja">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </span>
                            </summary>

                            <div className="pb-6 text-gris-claro font-light leading-relaxed">
                                <p>{item.a}</p>
                            </div>
                        </details>
                    ))}
                </div>

            </div>
        </section>
    );
}
