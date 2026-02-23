import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { extraerVideoId } from './youtube-utils';

export interface RawExercise {
    nombre: string;
    urlVideo: string | null;
    pagina: number;
    textoCompleto: string;
}

export async function parsearBibliotecaPDF(filePath: string): Promise<RawExercise[]> {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getInfo({ parsePageInfo: true });

    // Extract textual content per page
    // Since PDFParse.getText() gives flattened text, we'll try to split or re-parse
    // Actually, let's just get the text per page if possible.
    // PDFParse doesn't have a simple "getTextByPage", but we can use the 'partial' option.

    const allExercises: RawExercise[] = [];
    const totalPages = result.total;

    for (let p = 1; p <= totalPages; p++) {
        const pgResult = await parser.getText({ partial: [p] });
        const text = pgResult.text;

        // Find links on this page
        const links = result.pages.find(pg => pg.pageNumber === p)?.links || [];
        const ytLinks = links
            .map(l => l.url)
            .filter(url => (url.includes('youtu.be') || url.includes('youtube.com')) && (url.includes('watch') || url.length < 30));

        // In these PDFs, names are on Page P, links are on Page P+1 (starting P=2)
        // Wait, let's store them and correlate later
    }

    await parser.destroy();

    // RE-IMPLEMENTATION: We'll do a simpler strategy. 
    // Flatten all names from Page 2 to End.
    // Flatten all links from Page 3 to End.

    const parser2 = new PDFParse({ data: dataBuffer });
    const fullResult = await parser2.getText();
    const info = await parser2.getInfo({ parsePageInfo: true });
    await parser2.destroy();

    const pagesText = fullResult.text.split(/-- \d+ of \d+ --/);

    const namesByPage: string[][] = [];
    for (const pgText of pagesText) {
        if (!pgText.trim()) { namesByPage.push([]); continue; }

        const names = extractNamesFromPage(pgText);
        namesByPage.push(names);
    }

    const linksByPage: string[][] = info.pages.map(pg => {
        return pg.links
            .map(l => l.url)
            .filter(url => (url.includes('youtu.be') || url.includes('youtube.com')) && !url.includes('instagram'));
    });

    // Correlation:
    // Page 2 (idx 1) names -> Page 3 (idx 2) links
    // Page 3 (idx 2) names -> Page 4 (idx 3) links
    const correlated: RawExercise[] = [];

    for (let i = 1; i < namesByPage.length; i++) {
        const names = namesByPage[i];
        const links = linksByPage[i + 1] || []; // +1 offset based on observation

        for (let j = 0; j < names.length; j++) {
            correlated.push({
                nombre: names[j],
                urlVideo: links[j] || null,
                pagina: i + 1,
                textoCompleto: names[j] // Placeholder
            });
        }
    }

    return correlated;
}

function extractNamesFromPage(text: string): string[] {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const names: string[] = [];

    // Identificar los 5 IDs en la página
    const ids: { val: number, idx: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^(\d+)$/);
        if (match) {
            ids.push({ val: parseInt(match[1]), idx: i });
        }
    }

    if (ids.length === 0) return [];

    const blacklist = ["ANÁLISIS", "BIOMECÁNICO", "MÚSCULOS", "ACCESORIOS", "PRINCIPALES", "YOUTUBE", "PATRON DE", "MOVIMINTO", "TIPO DE EJERCICIO", "EJERCICIO", "Nº", "FOTO", "VIDEO"];
    const avoidWords = ["Articulación", "Músculo", "Empuje", "Tracción", "Aductores", "Gemelos", "Dorsal", "Pectoral", "Deltoides", "Biceps", "Triceps", "Cuádriceps", "Glúteos", "Monoarticular", "Multiarticular", "Cambio de nivel", "Bisagra", "Sentadilla"];

    const namePrefixes = ["Press", "Remo", "Sentadilla", "Curl", "Extensión", "Extension", "Jalón", "Jalon", "Peso Muerto", "Hip", "Elevación", "Elevacion", "Apertura", "Zancada", "Estocada", "Vuelos", "Cruces", "Peck", "Dorsalera", "Flexión", "Flexion", "Tracción", "Traccion", "Empuje", "Remo", "Zancadas", "Burras", "Swing", "Plancha", "Puente", "Dominada", "Fondos", "Abducción", "Abduccion", "Aducción", "Aduccion", "Prensa", "Box", "Step", "Arnold", "Skull", "Face", "Front", "Side", "Back", "Overhead", "Lateral", "Leg", "Chest", "Gakk"];

    let currentName = "";
    for (const line of lines) {
        if (anyMatch(line, avoidWords) || anyMatch(line, blacklist) || line.match(/^\d+$/) || line.includes("@gualda") || line.includes("www.") || line.includes("+")) {
            if (currentName) {
                // Split by tabs if concatenated
                const parts = currentName.split('\t');
                for (const p_raw of parts) {
                    const n = p_raw.trim();
                    const startsWithAction = namePrefixes.some(prefix => n.toLowerCase().startsWith(prefix.toLowerCase()));
                    if (n.length > 5 && startsWithAction && !anyMatch(n, blacklist) && !anyMatch(n, avoidWords)) {
                        names.push(n);
                    }
                }
                currentName = "";
            }
            continue;
        }

        if (currentName) {
            currentName += " " + line;
        } else {
            currentName = line;
        }
    }
    if (currentName) {
        const n = currentName.trim();
        if (n.length > 5 && !anyMatch(n, blacklist) && !anyMatch(n, avoidWords)) names.push(n);
    }

    return names;
}

function anyMatch(line: string, list: string[]): boolean {
    return list.some(item => line.includes(item));
}
