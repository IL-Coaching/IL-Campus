const fs = require('fs');

function extractWithAnchors(txtPath, infoPath) {
    const text = fs.readFileSync(txtPath, 'utf8');
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

    const allLinks = info.pages.flatMap(pg => pg.links
        .map(l => l.url)
        .filter(url => (url.includes('youtu.be') || url.includes('youtube.com')) && !url.includes('instagram'))
    );

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const exercises = [];

    const triggerWords = ["Articulación", "Músculo", "Monoarticular", "Multiarticular", "Pectoral", "Deltoides", "(Exte", "(Flex", "Biceps", "Triceps", "Trapecios", "Gluteo", "Anterior", "Dorsal", "YOUTUBE", "PATRON", "MOVIMIENTO", "TIPO", "EJERCICIO", "Nº", "FOTO", "VIDEO", "ANÁLISIS", "@gualda", "www.", "+54"];

    let lastId = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const idMatch = line.match(/^(\d+)(.*)$/);

        if (idMatch) {
            const id = parseInt(idMatch[1]);
            // Logic: we are looking for the NEXT sequential ID (or close to it)
            // But PDF column extraction is messy, so we'll just take ANY ID as a potential slot.

            let name = idMatch[2].trim();
            if (!name || triggerWords.some(t => name.includes(t))) {
                // Try next few lines for name
                let foundName = "";
                for (let j = 1; j < 5; j++) {
                    const nextLine = lines[i + j];
                    if (!nextLine) break;
                    if (triggerWords.some(t => nextLine.includes(t)) || nextLine.match(/^\d+$/)) break;
                    foundName += (foundName ? " " : "") + nextLine;
                }
                name = foundName;
            } else {
                // Name might continue on next lines
                for (let j = 1; j < 3; j++) {
                    const nextLine = lines[i + j];
                    if (!nextLine) break;
                    if (triggerWords.some(t => nextLine.includes(t)) || nextLine.match(/^\d+$/)) break;
                    name += " " + nextLine;
                }
            }

            if (name.length > 3) {
                exercises.push({ id, name: name.trim() });
            }
        }
    }

    // PDF 1 has 60 unique IDs 1-60. 
    // PDF 2 has 112 unique IDs 1-112.
    // Let's unique them by ID to avoid duplicates from headers/footers.
    const unique = [];
    const seen = new Set();
    // Sort by ID is tricky because of the messy extraction, but let's try.
    exercises.forEach(e => {
        if (!seen.has(e.id)) {
            unique.push(e);
            seen.add(e.id);
        }
    });

    unique.sort((a, b) => a.id - b.id);

    // Match with links
    const final = [];
    const linkCount = allLinks.length;
    for (let i = 0; i < Math.min(unique.length, linkCount); i++) {
        final.push({
            nombre: unique[i].name,
            urlVideo: allLinks[i]
        });
    }

    return final;
}

const res1 = extractWithAnchors(
    "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt",
    "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json"
);

const res2 = extractWithAnchors(
    "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt",
    "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json"
);

console.log(`PDF 1: ${res1.length} / 60`);
console.log(`PDF 2: ${res2.length} / 112`);
console.log(`Total: ${res1.length + res2.length} / 172`);

fs.writeFileSync('extracted_exercises_perfect.json', JSON.stringify([...res1, ...res2], null, 2));
