import json
import re

def get_yt_links(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    links = []
    # YouTube links are the interesting ones
    for pg in data['pages']:
        pg_yt = []
        for l in pg['links']:
            url = l['url']
            if 'youtu.be' in url or 'youtube.com' in url:
                if 'gualdatraining' not in url or 'watch' in url:
                    pg_yt.append(url)
        links.append(pg_yt)
    return links

def extract_names_from_text(txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pages = re.split(r'-- \d+ of \d+ --', content)
    all_names = []
    
    for pg_idx, pg in enumerate(pages):
        pg_names = []
        lines = [l.strip() for l in pg.split('\n') if l.strip()]
        
        # Heuristic: Exercise names are typically at the start of blocks.
        # Let's find segments that are separated by keywords
        keywords = ["Articulación", "Empuje", "Tracción", "Dorsal", "Pectoral", "Deltoides", "Biceps", "Triceps", "Monoarticular", "Multiarticular", "Cambio de nivel", "Bisagra", "Sentadilla"]
        
        current_block = []
        for line in lines:
            if any(k in line for k in keywords) or "@gualda" in line or "www." in line or "Nº" in line or "+" in line:
                if current_block:
                    name = " ".join(current_block).strip()
                    # Filter: name should be 1-4 lines, not just a number, not a keyword
                    if len(name) > 5 and not re.match(r'^\d+$', name) and not any(k == name for k in keywords):
                        # Avoid names that are actually descriptions
                        if "Articulación" not in name and "Músculos" not in name and "EJERCICIO" not in name:
                            pg_names.append(name)
                    current_block = []
            else:
                if not re.match(r'^\d+$', line):
                    current_block.append(line)
        
        if current_block:
            name = " ".join(current_block).strip()
            if len(name) > 5:
                pg_names.append(name)
        
        # Unique names per page while preserving order
        seen = set()
        unique_pg_names = []
        for n in pg_names:
            if n not in seen:
                unique_pg_names.append(n)
                seen.add(n)
        
        all_names.append(unique_pg_names)
        
    return all_names

def main():
    # Peso Libre
    peso_links = get_yt_links("Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json")
    peso_names = extract_names_from_text("Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt")
    
    # Maquinas
    maquinas_links = get_yt_links("Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json")
    maquinas_names = extract_names_from_text("Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt")
    
    final_exercises = []
    
    # Matching logic: Exercises on Page N match links on Page N+1 (usually)
    # Let's just flatten and correlate since the count is stable
    
    flattened_peso_names = [n for pg in peso_names for n in pg if len(n) > 3]
    flattened_peso_links = [l for pg in peso_links for l in pg]
    
    print(f"Peso Libre: {len(flattened_peso_names)} names, {len(flattened_peso_links)} links")
    
    flattened_maquinas_names = [n for pg in maquinas_names for n in pg if len(n) > 3]
    flattened_maquinas_links = [l for pg in maquinas_links for l in pg]
    
    print(f"Máquinas: {len(flattened_maquinas_names)} names, {len(flattened_maquinas_links)} links")

    # Sample output
    print("\nSample Peso (First 5):")
    for i in range(min(5, len(flattened_peso_names))):
        print(f"{i+1}: {flattened_peso_names[i]}")

    print("\nSample Maquinas (First 5):")
    for i in range(min(5, len(flattened_maquinas_names))):
        print(f"{i+1}: {flattened_maquinas_names[i]}")

if __name__ == "__main__":
    main()
