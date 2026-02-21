import { MessageCircle } from "lucide-react";

export default function MensajesPage() {
    return (
        <div className="space-y-8 fade-up visible">
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Mensajería
                </h1>
                <p className="text-gris font-medium text-sm">
                    Comunicación directa con tus alumnos
                </p>
            </div>

            <div className="bg-marino-2 border border-marino-4 rounded-xl h-[600px] flex overflow-hidden shadow-lg shadow-black/20">
                {/* Lista de Chats Sidebar */}
                <div className="w-80 border-r border-marino-4 bg-marino-3/20 hidden md:block">
                    <div className="p-4 border-b border-marino-4">
                        <div className="bg-marino border border-marino-4 p-2 rounded-lg text-xs text-gris italic text-center">
                            Buscador de chats desactivado
                        </div>
                    </div>
                    <div className="p-10 text-center flex flex-col items-center justify-center space-y-4 pt-20Opacity">
                        <MessageCircle size={32} className="text-gris/20" />
                        <p className="text-[0.6rem] font-bold text-gris uppercase tracking-[0.2em]">Sincronizando con WhatsApp Business</p>
                    </div>
                </div>

                {/* Ventana de Chat */}
                <div className="flex-1 flex flex-col bg-marino-2 relative">
                    <div className="p-20 flex flex-col items-center justify-center text-center m-auto">
                        <div className="w-20 h-20 bg-marino-3 rounded-2xl flex items-center justify-center mb-6 border border-marino-4 rotate-3 group hover:rotate-0 transition-transform">
                            <MessageCircle size={40} className="text-naranja" />
                        </div>
                        <h3 className="text-2xl font-barlow-condensed font-black text-blanco uppercase tracking-tighter mb-4">Central de Mensajería</h3>
                        <p className="text-gris max-w-md text-sm leading-relaxed mb-8">
                            Próximamente podrás responder las dudas de tus alumnos directamente desde este panel integrando WhatsApp y notificaciones push.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
