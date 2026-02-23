const fs = require('fs');

function extractWithIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const exercises = [];
    let currentId = null;
    let currentLines = [];

    const blacklist = ["ANÁLISIS", "BIOMECÁNICO", "MÚSCULOS", "ACCESORIOS", "PRINCIPALES", "YOUTUBE", "PATRON DE", "MOVIMINTO", "TIPO DE EJERCICIO", "EJERCICIO", "Nº", "FOTO", "VIDEO", "www.", "@gualda", "+54"];
    const avoidWords = ["Articulación", "Músculo", "Empuje", "Tracción", "Aductores", "Gemelos", "Dorsal", "Pectoral", "Deltoides", "Biceps", "Triceps", "Cuádriceps", "Glúteos", "Monoarticular", "Multiarticular", "Cambio de nivel", "Bisagra", "Sentadilla"];

    for (let line of lines) {
        const idMatch = line.match(/^(\d+)(.*)$/);

        if (idMatch) {
            // Save previous
            if (currentId !== null && currentLines.length > 0) {
                exercises.push({ id: currentId, name: currentLines.join(' ') });
            }

            currentId = idMatch[1];
            currentLines = [];
            const remainder = idMatch[2].trim();
            if (remainder && !blacklist.some(b => remainder.includes(b))) {
                currentLines.push(remainder);
            }
        } else {
            if (currentId !== null) {
                if (!blacklist.some(b => line.includes(b)) && !avoidWords.some(a => line.includes(a))) {
                    currentLines.push(line);
                }
            }
        }
    }

    // Last one
    if (currentId !== null && currentLines.length > 0) {
        exercises.push({ id: currentId, name: currentLines.join(' ') });
    }

    return exercises;
}

const pdf2 = "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt";
const results = extractWithIds(pdf2);
console.log(`Found ${results.length} exercises in PDF 2`);
console.log("First 5:", JSON.stringify(results.slice(0, 5), null, 2));
console.log("Last 5:", JSON.stringify(results.slice(-5), null, 2));
