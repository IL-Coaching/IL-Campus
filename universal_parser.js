const fs = require('fs');

const namePrefixes = ["Press", "Remo", "Sentadilla", "Curl", "Extensión", "Extension", "Jalón", "Jalon", "Peso Muerto", "Hip", "Elevación", "Elevacion", "Apertura", "Zancada", "Estocada", "Vuelos", "Cruces", "Peck", "Dorsalera", "Flexión", "Flexion", "Tracción", "Traccion", "Empuje", "Zancadas", "Swing", "Plancha", "Puente", "Dominada", "Fondos", "Abducción", "Abduccion", "Aducción", "Aduccion", "Prensa", "Box", "Step", "Arnold", "Skull", "Face", "Front", "Side", "Back", "Overhead", "Lateral", "Leg", "Chest", "Gakk", "Pull", "Bulgara"];

const triggerWords = ["Articulación", "Músculo", "Monoarticular", "Multiarticular", "Pectoral", "Deltoides", "(Exte", "(Flex", "Biceps", "Triceps", "Trapecios", "Gluteo", "Anterior", "Dorsal", "YOUTUBE", "PATRON", "MOVIMIENTO", "TIPO", "EJERCICIO", "Nº", "FOTO", "VIDEO", "ANÁLISIS", "raining.com", "Empuje vertical", "Empuje horizontal", "Tracción vertical", "Tracción horizontal"];

function parseDocument(pdfTxtPath, pdfInfoPath) {
    const text = fs.readFileSync(pdfTxtPath, 'utf8');
    const info = JSON.parse(fs.readFileSync(pdfInfoPath, 'utf8'));

    const allLinks = info.pages.flatMap(pg => pg.links
        .map(l => l.url)
        .filter(url => (url.includes('youtu.be') || url.includes('youtube.com')) && !url.includes('instagram'))
    );

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const names = [];
    let current = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // ID check
        let idMatch = line.match(/^(\d+)/);
        if (idMatch && idMatch[1].length < 5) {
            if (current) {
                names.push(current.trim());
                current = "";
            }
            line = line.substring(idMatch[1].length).trim();
        }

        if (!line) continue;

        // Trigger check
        let earliestT = -1;
        for (let t of triggerWords) {
            let idx = line.indexOf(t);
            if (idx !== -1 && (earliestT === -1 || idx < earliestT)) earliestT = idx;
        }
        if (line.includes("@gualda") || line.includes("www.") || line.includes("+54")) {
            let garbageIdx = line.search(/[@\+w]/);
            if (earliestT === -1 || (garbageIdx !== -1 && garbageIdx < earliestT)) earliestT = garbageIdx;
        }

        if (earliestT !== -1) {
            let part = line.substring(0, earliestT).trim();
            part = part.replace(/--+$/, '').trim();
            if (part && (namePrefixes.some(p => part.includes(p)) || current)) {
                if (current) current += " " + part;
                else current = part;
            }
            if (current) {
                names.push(current.trim());
                current = "";
            }
            continue;
        }

        // Potential name part
        const isPrefixStart = namePrefixes.some(p => line.startsWith(p));
        if (isPrefixStart && current && current.length > 15) {
            // Likely a new name starting on a new line
            names.push(current.trim());
            current = line;
        } else if (namePrefixes.some(p => line.includes(p)) || current) {
            if (current) current += " " + line;
            else current = line;
        }
    }
    if (current) names.push(current.trim());

    // Filter and unique roughly
    const filtered = names.filter(n => n.length > 5 && namePrefixes.some(p => n.includes(p)));

    console.log(`Doc ${pdfTxtPath}: Found ${filtered.length} names, ${allLinks.length} links.`);

    const results = [];
    for (let i = 0; i < allLinks.length; i++) {
        results.push({
            nombre: filtered[i] || `Ejercicio ${i + 1} (Identificación manual)`,
            urlVideo: allLinks[i]
        });
    }
    return results;
}

const r1 = parseDocument(
    "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt",
    "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json"
);
const r2 = parseDocument(
    "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt",
    "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json"
);

const total = [...r1, ...r2];
console.log(`Final Collection: ${total.length} paired exercises.`);
fs.writeFileSync('extracted_exercises_final.json', JSON.stringify(total, null, 2));
