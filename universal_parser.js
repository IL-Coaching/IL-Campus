const fs = require('fs');

const nameSuffixes = ["ress", "emo", "entadilla", "url", "xtens", "alón", "jalon", "eso muerto", "elevaci", "apertura", "zancada", "estocada", "vuelo", "vuelos", "cruce", "cruces", "peck", "flexi", "tracci", "swing", "plancha", "puente", "dominada", "fondo", "abducci", "aducci", "prensa", "step", "arnold", "skull", "face pull", "bulgara", "gakk", "hip thrust", "ancadilla", "ullover", "elevación", "aducción", "abducción", "flexión", "tracción", "mancuerna", "barra", "polea"];

const triggerWords = ["Articulación", "Músculo", "Monoarticular", "Multiarticular", "Pectoral", "Deltoides", "(Exte", "(Flex", "Biceps", "Triceps", "Trapecios", "Gluteo", "Anterior", "Dorsal", "YOUTUBE", "PATRON", "MOVIMIENTO", "TIPO", "EJERCICIO", "Nº", "FOTO", "VIDEO", "ANÁLISIS", "raining.com"];

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

    for (let line of lines) {
        let isId = line.match(/^\d+$/) && line.length < 5;
        if (isId) {
            if (current) names.push(current.trim());
            current = "";
            continue;
        }

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
            if (part && (nameSuffixes.some(s => part.toLowerCase().includes(s)) || current)) {
                if (current) current += " " + part;
                else current = part;
            }
            if (current) names.push(current.trim());
            current = "";
            continue;
        }

        if (nameSuffixes.some(s => line.toLowerCase().includes(s)) || current) {
            if (current) current += " " + line;
            else current = line;
        }
    }
    if (current) names.push(current.trim());

    // CRITICAL FIX: Aggressive cleaning
    const cleanNames = names.map(n => {
        let sc = n.replace(/^[^a-zA-ZÁÉÍÓÚñÑ]+/, '').trim(); // Remove leading non-letters
        sc = sc.replace(/--.*?--/g, '').trim(); // Remove -- X of Y --
        sc = sc.replace(/\(.*?\)/g, '').trim(); // Remove (Anything)
        sc = sc.replace(/\s\s+/g, ' '); // Collapse spaces
        sc = sc.replace(/\)/g, '').replace(/\(/g, ''); // Remove stray parentheses
        // Manual trim of known bad fragments that might have leaked
        const badSuffixes = ["Empuje vertical ascendente", "Empuje horizontal", "Deltoides", "Empuje vertical", "Triceps, Trapecios", "Pectoral mayor", "Flexión - aducción -", "Extensión", "Aducción horizontal", "Abducción", "Tracción", "horizontal", "vertical"];
        for (const bad of badSuffixes) {
            sc = sc.replace(new RegExp(bad, 'gi'), '').trim();
        }
        return sc;
    }).filter(n => n.length > 5 && nameSuffixes.some(s => n.toLowerCase().includes(s)));

    console.log(`Doc ${pdfTxtPath}: ${cleanNames.length} names, ${allLinks.length} links.`);

    const docResults = [];
    for (let i = 0; i < allLinks.length; i++) {
        docResults.push({
            nombre: cleanNames[i] || `Ejercicio ${i + 1} (Identificación manual requerida)`,
            urlVideo: allLinks[i]
        });
    }
    return docResults;
}

const r1 = parseDocument(
    "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt",
    "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json"
);
const r2 = parseDocument(
    "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt",
    "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json"
);

const final = [...r1, ...r2];
console.log(`Final collection: ${final.length} exercises.`);
fs.writeFileSync('extracted_exercises_final.json', JSON.stringify(final, null, 2));
