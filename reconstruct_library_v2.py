import json
import re

def get_yt_links(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    links = []
    for pg in data['pages']:
        for l in pg['links']:
            url = l['url']
            if 'youtu.be' in url or 'youtube.com' in url:
                # Clean generic links
                if 'gualdatraining' not in url or 'watch' in url:
                    links.append(url)
    return links

def parse_txt(txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by pages
    pages = re.split(r'-- \d+ of \d+ --', content)
    
    exercises = []
    
    for pg in pages:
        # Find the "EJERCICIO" and "ANÁLISIS" markers to locate the name column
        # OR just find all multi-line blocks that appear to be names.
        # Heuristic: Find all blocks of text that are between 2-4 lines and are uppercase-ish or CamelCase
        
        # Actually, let's find the sequence of exercises.
        # They usually follow the IDs.
        ids = re.findall(r'\n(\d+)\n', pg)
        if not ids: continue
        
        # After the IDs and the table header, we get descriptions.
        # Let's try to find names by looking for lines that are clearly NOT descriptions.
        lines = pg.split('\n')
        
        # Try to find sequences of names.
        # Names are usually listed after the table header "EJERCICIO".
        try:
            start_idx = -1
            for i, line in enumerate(lines):
                if "EJERCICIO" in line and "ANÁLISIS" in line:
                    start_idx = i
                    break
            
            if start_idx == -1: continue
            
            # The lines after start_idx until page end or next marker
            candidates = lines[start_idx+1:]
            
            # Group lines into names.
            current_name = []
            for line in candidates:
                line = line.strip()
                if not line: continue
                if len(line) < 2: continue
                if "@gualda" in line or "www.gualda" in line or "+" in line or "Nº" in line or "FOTO" in line:
                    break
                
                # If it's a number, it might be the start of a column or just junk
                if re.match(r'^\d+$', line):
                    continue
                
                # If it contains "Articulación" or "Empuje" or "Dorsal", it's likely a different column
                if "Articulación" in line or "Empuje" in line or "Tracción" in line or "Pectoral" in line or "Deltoides" in line or "Biceps" in line or "Triceps" in line:
                    # We hit the next columns. We might have collected multiple names if they are column-wise.
                    # Actually, the layout is usually:
                    # Name 1
                    # Name 2
                    # Name 3
                    # column 2 row 1
                    # column 2 row 2...
                    break
                
                current_name.append(line)
            
            # Filter and split the collected names.
            # Sometimes multiple names are joined.
            full_text = " ".join(current_name)
            # This is hard. Let's try a different strategy.
            
        except Exception:
            pass
            
    return exercises

# Let's try to just find all names by looking for them in the text globally.
# I'll use the IDs as anchors.

def extract_names_robustly(txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    
    exercises = []
    
    # State machine to find "EJERCICIO" blocks
    in_ejercicio_block = False
    current_names = []
    
    for i, line in enumerate(lines):
        if ("EJERCICIO" in line and "ANÁLISIS" in line) or ("EJERCICIO" in line and "Nº" in line):
            in_ejercicio_block = True
            current_names = []
            continue
            
        if in_ejercicio_block:
            if "@gualda" in line or "www." in line or "Nº" in line or "FOTO" in line or "--" in line:
                in_ejercicio_block = False
                # Filter current_names to remove things that look like other columns
                clean_names = []
                temp_name = ""
                for n in current_names:
                    # If line looks like a different column, stop
                    if "Articulación" in n or "Empuje" in n or "Tracción" in n or "Músculo" in n or "MÚSCULO" in n or "ANÁLISIS" in n:
                        break
                    # If it's a number, it might be the start of a new section
                    if re.match(r'^\d+$', n):
                        continue
                    
                    # Accumulate name
                    if temp_name:
                        # If the line starts with lowercase or is an "en", "con", "de", add it
                        if n[0].islower() or n.lower().startswith(("con", "de", "en", "unilateral", "bilateral", "con", "barra", "mancuerna")):
                            temp_name += " " + n
                        else:
                            clean_names.append(temp_name)
                            temp_name = n
                    else:
                        temp_name = n
                if temp_name:
                    clean_names.append(temp_name)
                
                for cn in clean_names:
                    if len(cn) > 5:
                        exercises.append(cn)
                current_names = []
            else:
                current_names.append(line)
    
    return exercises

def main():
    # Peso Libre
    peso_links = get_yt_links("Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.info.json")
    peso_names = extract_names_robustly("Extras/Bibliotecas de ejercicios/16_02_2025_579158_1211  Biblioteca Peso libre con carga externa-.pdf.txt")
    
    # Maquinas
    maquinas_links = get_yt_links("Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.info.json")
    maquinas_names = extract_names_robustly("Extras/Bibliotecas de ejercicios/17_48_2024_515405_Biblioteca Máquinas e Instalaciones de Gimnasio-.pdf.txt")
    
    print(f"Peso: {len(peso_names)} names, {len(peso_links)} links")
    print(f"Maquinas: {len(maquinas_names)} names, {len(maquinas_links)} links")
    
    # Sample check
    print("\nFirst 10 Peso Names:")
    for n in peso_names[:10]: print("- " + n)
    
    print("\nFirst 10 Maquinas Names:")
    for n in maquinas_names[:10]: print("- " + n)

    # Let's try to match them. If lengths are close, we can use zip.
    # Otherwise, we might need manual fixing.
    
    final_data = []
    
    # Limit to min length to be safe or investigate discrepancies
    for i in range(min(len(peso_names), len(peso_links))):
        final_data.append({
            "nombre": peso_names[i],
            "urlVideo": peso_links[i],
            "categoria": "Peso Libre"
        })
        
    for i in range(min(len(maquinas_names), len(maquinas_links))):
        final_data.append({
            "nombre": maquinas_names[i],
            "urlVideo": maquinas_links[i],
            "categoria": "Máquinas"
        })
        
    with open("extracted_exercises_v2.json", "w", encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
