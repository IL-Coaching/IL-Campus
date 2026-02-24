import MensajeriaPanel from "./componentes/MensajeriaPanel";

export default function MensajeriaPage() {
    return (
        <div className="space-y-6 fade-up visible">
            <div>
                <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tight text-blanco mb-1">
                    Mensajería y Check-ins
                </h1>
                <p className="text-gris font-medium text-sm">
                    Chat directo con tus alumnos y bandeja de seguimiento
                </p>
            </div>

            <MensajeriaPanel />
        </div>
    );
}
