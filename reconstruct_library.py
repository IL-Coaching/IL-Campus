import json
import re
import os

def extract_from_peso_libre():
    txt_path = "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt"
    json_path = "Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        info = json.load(f)
    
    with open(txt_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Get YouTube links per page
    links_map = {}
    for pg in info['pages']:
        yt = [l['url'] for l in pg['links'] if 'youtu.be' in l['url'] or 'youtube.com' in l['url']]
        links_map[pg['pageNumber']] = yt

    # Parse names from text
    # Heuristic: Find "-- N of M --" to identify pages
    pages_txt = []
    current_page = []
    for line in lines:
        if "--" in line and "of" in line:
            if current_page:
                pages_txt.append(current_page)
            current_page = []
        else:
            current_page.append(line.strip())
    if current_page:
        pages_txt.append(current_page)

    exercises = []
    # Exercises start from page 2 (index 1)
    for i in range(1, len(pages_txt)):
        pg_lines = pages_txt[i]
        pg_num = i + 1
        pg_links = links_map.get(pg_num, [])
        
        # In this PDF, names are usually at the beginning or after the numbers
        # Let's find all lines that are just a number
        nums = []
        for idx, line in enumerate(pg_lines):
            if re.match(r'^\d+$', line):
                nums.append((int(line), idx))
        
        # Sort nums by visual order (index)
        nums.sort(key=lambda x: x[1])
        
        for j in range(len(nums)):
            num_val, start_idx = nums[j]
            # Name is after the number until we hit a keyword
            name_parts = []
            for k in range(start_idx + 1, len(pg_lines)):
                l = pg_lines[k]
                if not l or "Articulación" in l or "Deltoides" in l or "Pectoral" in l or "Empuje" in l or "Tracción" in l or "@gualda" in l or "Nº" in l or "EJERCICIO" in l or "YOUTUBE" in l or re.match(r'^\d+$', l):
                    break
                name_parts.append(l)
            
            name = " ".join(name_parts).strip()
            if name:
                video = pg_links[j] if j < len(pg_links) else None
                exercises.append({
                    "id": num_val,
                    "nombre": name,
                    "urlVideo": video,
                    "origen": "Peso Libre"
                })

    return exercises

def extract_from_maquinas():
    txt_path = "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt"
    json_path = "Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        info = json.load(f)
    
    with open(txt_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    links_map = {}
    for pg in info['pages']:
        yt = [l['url'] for l in pg['links'] if 'youtu.be' in l['url'] or 'youtube.com' in l['url']]
        links_map[pg['pageNumber']] = yt

    pages_txt = []
    current_page = []
    for line in lines:
        if "--" in line and "of" in line:
            if current_page:
                pages_txt.append(current_page)
            current_page = []
        else:
            current_page.append(line.strip())
    if current_page:
        pages_txt.append(current_page)

    exercises = []
    for i in range(1, len(pages_txt)):
        pg_lines = pages_txt[i]
        pg_num = i + 1
        pg_links = links_map.get(pg_num, [])
        
        nums = []
        for idx, line in enumerate(pg_lines):
            if re.match(r'^\d+$', line):
                nums.append((int(line), idx))
        
        nums.sort(key=lambda x: x[1])
        
        # The number of exercises on page might not match the number of links if some links are grouped
        # But let's try 1-to-1 matching first
        for j in range(len(nums)):
            num_val, start_idx = nums[j]
            name_parts = []
            for k in range(start_idx + 1, len(pg_lines)):
                l = pg_lines[k]
                if not l or "Articulación" in l or "Deltoides" in l or "Pectoral" in l or "Empuje" in l or "Tracción" in l or "Dorsal" in l or "@gualda" in l or "Nº" in l or "EJERCICIO" in l or "YOUTUBE" in l or re.match(r'^\d+$', l):
                    break
                name_parts.append(l)
            
            name = " ".join(name_parts).strip()
            if name and len(name) > 3: # Avoid small artifacts
                video = pg_links[j] if j < len(pg_links) else None
                exercises.append({
                    "id": num_val,
                    "nombre": name,
                    "urlVideo": video,
                    "origen": "Máquinas"
                })

    return exercises

def main():
    peso = extract_from_peso_libre()
    maquinas = extract_from_maquinas()
    
    total = peso + maquinas
    print(f"Extracted {len(peso)} from Peso Libre")
    print(f"Extracted {len(maquinas)} from Máquinas")
    print(f"Total: {len(total)}")
    
    with open("extracted_exercises.json", "w", encoding='utf-8') as f:
        json.dump(total, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
