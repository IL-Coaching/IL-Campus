import Link from 'next/link';

interface Props {
    footerTexto?: string | null;
}

export default function Footer({ footerTexto }: Props) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-marino border-t border-marino-4 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Izquierda: Logotipo "IL" */}
                <div className="flex-shrink-0">
                    <span className="text-4xl font-barlow-condensed font-black italic text-naranja leading-none tracking-tighter hover:text-naranja-h transition-colors">IL</span>
                </div>

                {/* Centro: Copyright */}
                <div className="text-center md:flex-grow">
                    <p className="text-gris text-sm font-medium">
                        {footerTexto || `IL-Coaching © ${currentYear}. Todos los derechos reservados.`}
                    </p>
                </div>

                {/* Derecha: Links */}
                <div className="flex items-center gap-6">
                    <Link href="#" className="font-barlow-condensed font-bold tracking-widest text-[0.65rem] uppercase text-gris hover:text-naranja transition-colors">Términos</Link>
                    <Link href="#" className="font-barlow-condensed font-bold tracking-widest text-[0.65rem] uppercase text-gris hover:text-naranja transition-colors">Privacidad</Link>
                    <Link href="#planes" className="font-barlow-condensed font-bold tracking-widest text-[0.65rem] uppercase text-gris hover:text-naranja transition-colors">Planes</Link>
                </div>

            </div>
        </footer>
    );
}
