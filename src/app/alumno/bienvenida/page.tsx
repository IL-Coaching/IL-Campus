import TransicionEpica from '@/compartido/componentes/TransicionEpica';

export default function BienvenidaPage() {
    return <TransicionEpica duracion={2500} destino="/alumno/dashboard" />;
}
