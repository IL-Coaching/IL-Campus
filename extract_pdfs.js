const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        await parser.destroy();
        return result.text;
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
        console.log(`--- EXTRACTING: ${file} ---`);
        const text = await extractText(file);
        if (text) {
            fs.writeFileSync(file + ".txt", text);
            console.log(`Saved to ${file}.txt`);
        }
    }
}

main();
