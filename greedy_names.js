const fs = require('fs');

const namePrefixes = ["Press", "Remo", "Sentadilla", "Curl", "Extensión", "Extension", "Jalón", "Jalon", "Peso Muerto", "Hip", "Elevación", "Elevacion", "Apertura", "Zancada", "Estocada", "Vuelos", "Cruces", "Peck", "Dorsalera", "Flexión", "Flexion", "Tracción", "Traccion", "Empuje", "Remo", "Zancadas", "Burras", "Swing", "Plancha", "Puente", "Dominada", "Fondos", "Abducción", "Abduccion", "Aducción", "Aduccion", "Prensa", "Box", "Step", "Arnold", "Skull", "Face", "Front", "Side", "Back", "Overhead", "Lateral", "Leg", "Chest", "Gakk", "Aperturas", "Vuelos", "Cruce", "Cruces", "Pull", "Pullover"];

const avoidWords = ["Articulación", "Músculo", "Empuje", "Tracción", "Aductores", "Gemelos", "Dorsal", "Pectoral", "Deltoides", "Biceps", "Triceps", "Cuádriceps", "Glúteos", "Monoarticular", "Multiarticular", "Cambio de nivel", "Bisagra", "Sentadilla", "PRINCIPALES", "ACCESORIOS", "BIOMECÁNICO", "YOUTUBE", "PATRON", "MOVIMIENTO", "TIPO", "EJERCICIO", "Nº", "FOTO", "VIDEO", "ANÁLISIS"];

function extractGreedy(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const names = [];
    for (let line of lines) {
        const lower = line.toLowerCase();
        const hasPrefix = namePrefixes.some(p => lower.includes(p.toLowerCase()));
        const isBlacklisted = avoidWords.some(a => line.includes(a));
        const hasLink = lower.includes("http") || lower.includes("www");
        const hasGarbage = lower.includes("@gualda") || lower.includes("+54");

        if (hasPrefix && !isBlacklisted && !hasLink && !hasGarbage) {
            names.push(line);
        }
    }
    return names;
}

const txt1 = "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt";
const txt2 = "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt";

const n1 = extractGreedy(fs.readFileSync(txt1, 'utf8'));
const n2 = extractGreedy(fs.readFileSync(txt2, 'utf8'));

console.log(`Greedy names in TXT 1: ${n1.length}`);
console.log(`Greedy names in TXT 2: ${n2.length}`);
console.log(`Total: ${n1.length + n2.length}`);
console.log("Samples from TXT 2:", n2.slice(0, 10));
