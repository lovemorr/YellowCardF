import modal
import subprocess
import os
import lxml.etree as ET

app = modal.App("corel-inspector")

image = (
    modal.Image.debian_slim()
    .apt_install("inkscape")
    .pip_install("lxml")
    .add_local_dir(".", remote_path="/data")
)

@app.function(image=image)
def analyze_layout(filenames: list[str]):
    """
    Extracts font styles, sizes, coordinates, and looks for QR code candidates.
    """
    results = {}

    for filename in filenames:
        input_path = f"/data/{filename}"
        if not os.path.exists(input_path): continue

        svg_filename = f"/tmp/{filename}.svg"
        
        # Convert to Plain SVG (easier to parse)
        try:
            subprocess.run([
                "inkscape", input_path, 
                "--export-type=svg", "--export-plain-svg", 
                f"--export-filename={svg_filename}"
            ], check=True, capture_output=True)
        except subprocess.CalledProcessError:
            results[filename] = "Conversion Failed"
            continue

        layout_data = {
            "text_fields": [],
            "images": [],
            "potential_qr_groups": []
        }

        try:
            tree = ET.parse(svg_filename)
            root = tree.getroot()
            ns = {'svg': 'http://www.w3.org/2000/svg'}

            # 1. ANALYZE TEXT (Font, Size, Position)
            for text_elem in root.findall(".//svg:text", ns):
                # Inkscape puts style in 'style' attribute or individual attrs
                style = text_elem.get("style", "")
                
                # Simple parsing of style string (e.g., "font-size:12px;font-family:Arial")
                style_dict = {}
                if style:
                    style_dict = dict(item.split(":") for item in style.split(";") if ":" in item)
                
                # Get raw text content (handling tspan children)
                content = "".join(text_elem.itertext()).strip()
                if not content: continue

                field_info = {
                    "content": content[:50], # Truncate for display
                    "x": text_elem.get("x"),
                    "y": text_elem.get("y"),
                    "font-family": style_dict.get("font-family", "Unknown"),
                    "font-size": style_dict.get("font-size", "Unknown"),
                    "id": text_elem.get("id")
                }
                layout_data["text_fields"].append(field_info)

            # 2. LOCATE QR CODE CANDIDATES
            
            # A. Look for embedded images (Base64)
            for img in root.findall(".//svg:image", ns):
                layout_data["images"].append({
                    "id": img.get("id"),
                    "x": img.get("x"),
                    "y": img.get("y"),
                    "width": img.get("width"),
                    "height": img.get("height"),
                    "type": "Embedded Image"
                })

            # C. Look for Rectangles (Backgrounds/Ghost Squares)
            for rect in root.findall(".//svg:rect", ns):
                try:
                    w = float(rect.get("width", 0))
                    h = float(rect.get("height", 0))
                    if 60 < w < 70 and 60 < h < 70:
                         layout_data["images"].append({ # Reusing 'images' list for simplicity or create new
                            "id": rect.get("id"),
                            "x": rect.get("x"),
                            "y": rect.get("y"),
                            "width": w,
                            "height": h,
                            "type": "Suspicious RECT"
                        })
                except ValueError:
                    pass

            # B. Look for 'QR-like' Groups (Groups with many small paths)
            for group in root.findall(".//svg:g", ns):
                # Count paths in this group
                paths = group.findall("svg:path", ns)
                rects = group.findall("svg:rect", ns)
                count = len(paths) + len(rects)
                
                # QR codes usually have many small elements (>20) in a square-ish aspect ratio
                if count > 20:
                    layout_data["potential_qr_groups"].append({
                        "id": group.get("id"),
                        "element_count": count,
                        "note": "Possible Vector QR Code"
                    })

        except Exception as e:
            results[filename] = f"Error: {e}"
            continue

        results[filename] = layout_data

    return results

@app.local_entrypoint()
def main():
    target_files = ["tzn sample.cdr", "zim sample.cdr"]
    print(f"Analyzing layout for: {target_files}")
    
    analysis = analyze_layout.remote(target_files)
    
    output_lines = []
    
    for fname, data in analysis.items():
        output_lines.append(f"\n==========================================")
        output_lines.append(f"FILE: {fname}")
        output_lines.append(f"==========================================")
        
        output_lines.append(f"\n[POTENTIAL QR CODES]")
        if isinstance(data, dict):
            if data.get('images'):
                for img in data['images']:
                    output_lines.append(f"  Found Image at (x={img['x']}, y={img['y']}) Size: {img['width']}x{img['height']}")
            elif data.get('potential_qr_groups'):
                for grp in data['potential_qr_groups']:
                    output_lines.append(f"  Found Vector Group '{grp['id']}' with {grp['element_count']} elements (Likely QR)")
            else:
                output_lines.append("  No obvious QR code found (might be part of background or single path)")

            output_lines.append(f"\n[TEXT STYLES (Sample of first 100)]")
            # Sort by Y position to read top-down
            if data.get('text_fields'):
                sorted_text = sorted(data['text_fields'], key=lambda k: float(k['y']) if k['y'] else 0)
                
                for item in sorted_text[:100]:
                    output_lines.append(f"  Text: {item['content']}")
                    output_lines.append(f"    Font: {item.get('font-family')} | Size: {item.get('font-size')}")
                    output_lines.append(f"    Pos:  ({item['x']}, {item['y']})")
                    output_lines.append("    ---")
        else:
             output_lines.append(f"Error analyzing file: {data}")

    with open("inspector_result.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    
    print("Analysis complete. Results written to inspector_result.txt")
