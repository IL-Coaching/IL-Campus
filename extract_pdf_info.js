const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractInfo(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getInfo({ parsePageInfo: true });
        await parser.destroy();
        return result;
    } catch (err) {
        console.error(`Error parsing ${filePath}:`, err);
        return null;
    }
}

async function main() {
    const pdfs = [
        "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf",
        "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf"
    ];

    for (const file of pdfs) {
        console.log(`--- INFO: ${file} ---`);
        const info = await extractInfo(file);
        if (info) {
            fs.writeFileSync(file + ".info.json", JSON.stringify(info, null, 2));
            console.log(`Saved info to ${file}.info.json`);
        }
    }
}

main();
