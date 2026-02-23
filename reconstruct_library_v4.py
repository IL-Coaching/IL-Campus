import json
import re

def get_yt_links(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    links = []
    for pg in data['pages']:
        pg_yt = []
        for l in pg['links']:
            url = l['url']
            if 'youtu.be' in url or 'youtube.com' in url:
                if 'gualdatraining' not in url or 'watch' in url:
                    pg_yt.append(url)
        # Usually 5 links per page after the title page
        if pg_yt:
            links.append(pg_yt)
    return links

def extract_names_from_text_v4(txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pages = re.split(r'-- \d+ of \d+ --', content)
    all_names = []
    
    blacklist = ["ANÁLISIS", "BIOMECÁNICO", "MÚSCULOS", "ACCESORIOS", "PRINCIPALES", "YOUTUBE", "PATRON DE", "MOVIMINTO", "TIPO DE EJERCICIO"]
    keywords = ["Articulación ", "(", ")", "Empuje ", "Tracción ", "Aductores", "gemelos", "Dorsal ", "Pectoral ", "Deltoides ", "Biceps ", "Triceps ", "Cuádriceps", "Glúteos", "Monoarticular", "Multiarticular", "ascendente", "horizontal", "vertical", "descendente"]
    
    for pg in pages:
        pg_ejercicios = []
        lines = [l.strip() for l in pg.split('\n') if l.strip()]
        
        # Find where "EJERCICIO" header ends
        start_idx = -1
        for i, line in enumerate(lines):
            if "EJERCICIO" in line and ("ANÁLISIS" in line or "Nº" in line):
                start_idx = i
                break
        
        if start_idx == -1: continue
        
        candidates = lines[start_idx+1:]
        current_name = ""
        
        # In these PDFs, names are grouped first, then other columns?
        # Let's try to find blocks of lines that are ONLY names.
        for line in candidates:
            if any(k in line for k in keywords) or any(b in line for b in blacklist) or "@gualda" in line or "www." in line or "+" in line or re.match(r'^\d+$', line) or line == "EJERCICIO":
                if current_name:
                    pg_ejercicios.append(current_name.strip())
                    current_name = ""
                # If we hit a core keyword, we've likely moved past the names list on this page
                if "Articulación" in line or "Empuje" in line or "Tracción" in line:
                    break
                continue
            
            if current_name:
                current_name += " " + line
            else:
                current_name = line
        
        if current_name:
            pg_ejercicios.append(current_name.strip())
            
        # Clean up
        cleaned = [n for n in pg_ejercicios if len(n) > 5 and not any(b in n for b in blacklist)]
        if cleaned:
            all_names.append(cleaned)
            
    return all_names

def main():
    peso_links = get_yt_links("Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json")
    peso_names = extract_names_from_text_v4("Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt")
    
    maquinas_links = get_yt_links("Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json")
    maquinas_names = extract_names_from_text_v4("Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt")
    
    # Matching
    print("Alignment Check - Peso Libre")
    print(f"Names Pages: {len(peso_names)}, Links Pages: {len(peso_links)}")
    
    # Correlate
    # Peso names start from pg 2 (idx 0 in peso_names). Links start from pg 3 (idx 0 in peso_links).
    # So peso_names[0] matches peso_links[0].
    
    total_data = []
    for i in range(min(len(peso_names), len(peso_links))):
        p_names = peso_names[i]
        p_links = peso_links[i]
        for j in range(min(len(p_names), len(p_links))):
            total_data.append({"nombre": p_names[j], "urlVideo": p_links[j], "categoria": "Peso Libre"})
            
    for i in range(min(len(maquinas_names), len(maquinas_links))):
        m_names = maquinas_names[i]
        m_links = maquinas_links[i]
        for j in range(min(len(m_names), len(m_links))):
            total_data.append({"nombre": m_names[j], "urlVideo": m_links[j], "categoria": "Máquinas"})
            
    with open("extracted_exercises_v4.json", "w", encoding='utf-8') as f:
        json.dump(total_data, f, indent=2, ensure_ascii=False)
        
    print(f"Extracted {len(total_data)} exercises")
if __name__ == "__main__":
    main()
