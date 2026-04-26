import modal
import subprocess
import os
import lxml.etree as ET
import base64
import io

# --- CONFIGURATION ---

# 1. Field Mapping: Defines which Vercel form field maps to which text in the Corel Template
#    Key = Vercel Form ID (from form.html)
#    Value = The specific text currently inside your .cdr file that needs to be replaced.
VERCEL_TO_COREL_MAPPING = {
    # Certificate Details
    "yellow_card_number": "TZ6984562",
    "policy_number": "NICS5231464984",
    "pic_name": "National Insurance Corporation Ltd",
    
    # Dates
    "issued_on": "09-07-25",
    "issued_timestamp": "01-01-2023 10:00:00",
    "valid_from": "18-08-25",
    "valid_upto": "17-07-26",
    
    # Client / Vehicle Details
    "customer_name": "Dingsheng Transport Ltd",
    "vehicle_make": "Shacman",
    "vehicle_reg_number": "AAC926SF",
    "vehicle_engine_number": "1612G085398",
    "vehicle_chassis_number": "LGZJLNT45CX067074",
    
    # New Fields (NOW MAPPED!)
    "vehicle_type": "Lorry",
    "vehicle_usage": "Commercial",
    "customer_address": "Rua 6 Munhava Beira", 
    "insurer_address": "P O Box 9264 \n Dar es Salaam", # Using newline to match potential multi-line scan text
    "financial_total": "TZS 199 000.00",
    # Note: 'financial_premium' was 'TZS 0' in inspector, mapping it just in case
    "financial_premium": "TZS 0", 

    "countries_covered": "MW,ZM,ZW,CD",
    
    # Official Contacts
    "issuing_nb_contact": "National Insurance Corporation Ltd\nP O Box 9264 Da",
    "secretariat_contact": "+260 211 123456"
}

# 2. Example Job Data (Simulating input from the Vercel App)
SAMPLE_VERCEL_PAYLOAD = {
    "yellow_card_number": "YC-TEST-001",
    "policy_number": "POL-TEST-999",
    "pic_name": "Zalari Insurance",
    "serial_number": "0066174", # The Auto-Incremented Serial
    
    "issued_on": "24-01-2026",
    "issued_timestamp": "24-01-2026 10:00:00",
    "valid_from": "24-01-2026",
    "valid_upto": "24-01-2027",
    
    "customer_name": "John Doe Logistics",
    "customer_address": "123 Test Street, Harare, ZW",
    
    "vehicle_make": "Volvo FH16",
    "vehicle_reg_number": "TEST-REG-1",
    "vehicle_engine_number": "V-ENG-001",
    "vehicle_chassis_number": "V-CHS-001",
    "vehicle_type": "Heavy Bus",
    "vehicle_usage": "Private",
    "vehicle_color": "Blue", # Unmapped in Corel, ignored
    "no_of_seats": "60",   # Unmapped in Corel, ignored
    
    "countries_covered": "ZIM, ZAM",
    "issuing_nb_contact": "+260 970 000 000",
    "secretariat_contact": "+254 700 000 000",
    
    "financial_total": "USD 500.00",
    "financial_premium": "USD 450.00"
}

# 3. Job Configuration Construction
REPLACEMENT_JOBS = {
    "tzn sample.cdr": {
        "text": {}, 
        "qr_data": "https://verify.yellowcard.com/tzn/YC-TEST-001",
        "serial_number": SAMPLE_VERCEL_PAYLOAD.get("serial_number") # Logic for Zone Replacement
    }
}

# Populate the text replacements dynamically for the sample job
for field_key, template_text in VERCEL_TO_COREL_MAPPING.items():
    if field_key in SAMPLE_VERCEL_PAYLOAD:
        # Map: Template Text -> New Value from Payload
        val = SAMPLE_VERCEL_PAYLOAD[field_key]
        REPLACEMENT_JOBS["tzn sample.cdr"]["text"][template_text] = val

app = modal.App("corel-text-editor")

# Added qrcode and pillow for image generation
image = (
    modal.Image.debian_slim()
    .apt_install("inkscape")
    .pip_install("lxml", "qrcode[pil]", "Pillow")
    .add_local_dir(".", remote_path="/data")
)

def generate_qr_base64(data: str):
    """Generates a QR code and returns it as a base64 data URI.
    Transparent background, no border/margin for tight fit in CorelDRAW templates."""
    import qrcode
    from PIL import Image
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=0
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create image with transparency
    img = qr.make_image(fill_color="#000000", back_color=None)
    
    # Convert to RGBA for transparency support
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

@app.function(image=image)
def process_cdr_files(file_configs: dict, output_format: str = "pdf"):
    import lxml.etree as ET
    output_files = {} 

    for filename, config in file_configs.items():
        input_path = f"/data/{filename}"
        if not os.path.exists(input_path): continue

        replacements = config.get("text", {})
        qr_data = config.get("qr_data")
        # Define Serial Number if present in config (Key: 'serial_number')
        # We assume the config might pass a specific serial number, or we use a default
        new_serial_number = config.get("serial_number") 

        svg_filename = f"/tmp/{filename}_working.svg"
        output_filename = f"/tmp/{filename}_processed.{output_format}"

        # 1. Convert CDR -> SVG
        subprocess.run([
            "inkscape", input_path, "--export-type=svg", "--export-plain-svg", 
            f"--export-filename={svg_filename}"
        ], check=True)

        # 2. Parse SVG
        parser = ET.XMLParser(remove_blank_text=True)
        tree = ET.parse(svg_filename, parser)
        root = tree.getroot()
        ns = {'svg': 'http://www.w3.org/2000/svg', 'xlink': 'http://www.w3.org/1999/xlink'}

        # 3. Text Replacement (Standard Fields)
        count = 0
        for elem in root.iter():
            # Update: Helper to safely truncate and replace
            def safe_replace(text_node, replaces):
                if not text_node.text: return 0
                c = 0
                for old, new in replaces.items():
                    if old in text_node.text:
                        # Safety Truncate: If new text is huge (>50 chars), cut it for safety?
                        # We rely on frontend validation mostly, but let's ensure string format
                        text_node.text = text_node.text.replace(old, str(new))
                        c += 1
                return c

            if elem.text:
                count += safe_replace(elem, replacements)
            if elem.tail:
                # Same logic for tail but manually implemented to avoid recursion confusion
                for old, new in replacements.items():
                    if elem.tail and old in elem.tail:
                        elem.tail = elem.tail.replace(old, str(new))
                        count += 1

        # 4. Special Zone Replacement: Serial Number (Bottom Right)
        # Zone: X > 470, Y > 460 (Based on Inspector)
        if new_serial_number:
            serial_zone_digits = []
            captured_style = ""
            captured_parent = None
            
            # Find all text elements in the zone
            for text_elem in root.findall(".//svg:text", ns):
                try:
                    x = float(text_elem.get("x", 0))
                    y = float(text_elem.get("y", 0))
                    
                    if x > 470 and y > 460:
                        serial_zone_digits.append(text_elem)
                        # Capture style from the first digit we find
                        if not captured_style:
                            captured_style = text_elem.get("style", "")
                            captured_parent = text_elem.getparent()
                except ValueError:
                    pass
            
            if serial_zone_digits and captured_parent is not None:
                print(f"[{filename}] Found {len(serial_zone_digits)} separate digits in Serial Zone. Replacing with '{new_serial_number}'...")
                
                # 1. Capture the position of the LEFT-MOST digit to start the new number there
                # Sort by X to find start
                serial_zone_digits.sort(key=lambda e: float(e.get("x", 9999)))
                start_x = serial_zone_digits[0].get("x")
                start_y = serial_zone_digits[0].get("y")
                
                # 2. Delete all existing digits
                for digit in serial_zone_digits:
                    digit.getparent().remove(digit)
                
                # 3. Create NEW Element
                new_elem = ET.SubElement(captured_parent, "{http://www.w3.org/2000/svg}text")
                new_elem.set("x", start_x)
                new_elem.set("y", start_y)
                new_elem.set("style", captured_style) # Apply stolen style
                new_elem.set("id", "injected_serial_number")
                new_elem.text = new_serial_number
            else:
                 print(f"[{filename}] Warning: No digits found in Serial Zone to replace.")

        # 5. Clean Background Noise (The "Blue Grid" Fix)
        # Inkscape renders the background pattern as dozens of individual 65x65 images/rects.
        deleted_tiles = 0
        
        # A. Delete Images (65x65)
        for img in root.findall(".//svg:image", ns):
            try:
                w = float(img.get("width", 0))
                h = float(img.get("height", 0))
                if 60 < w < 70 and 60 < h < 70:
                    img.getparent().remove(img)
                    deleted_tiles += 1
            except ValueError:
                pass

        # B. Delete Rectangles (65x65) - These often sit behind/with the images
        for rect in root.findall(".//svg:rect", ns):
            try:
                w = float(rect.get("width", 0))
                h = float(rect.get("height", 0))
                if 60 < w < 70 and 60 < h < 70:
                    rect.getparent().remove(rect)
                    deleted_tiles += 1
            except ValueError:
                pass
        
        if deleted_tiles > 0:
            print(f"[{filename}] Cleaned up {deleted_tiles} background pattern tiles/rects.")

        # 6. Replace QR Code
        if qr_data:
            qr_b64 = generate_qr_base64(qr_data)
            qr_replaced = False
            
            # We look for the image at the coordinates we found (approx x > 600, y > 350)
            for img in root.findall(".//svg:image", ns):
                x = float(img.get("x", 0))
                y = float(img.get("y", 0))
                
                # Logic: If it's in the bottom right corner, it's the QR code
                # Note: The QR code is usually ~30x30, so it won't be deleted by the cleaner above
                if x > 600 and y > 350:
                    img.set(f"{{{ns['xlink']}}}href", qr_b64)
                    img.set("href", qr_b64)
                    qr_replaced = True
                    break
            
            if not qr_replaced:
                print(f"[{filename}] Warning: Could not find QR code image tag.")

        print(f"[{filename}] Replaced {count} text instances.")
        tree.write(svg_filename)

        # 6. Export back to PDF
        subprocess.run([
            "inkscape", svg_filename, f"--export-type={output_format}",
            f"--export-filename={output_filename}"
        ], check=True)
        
        with open(output_filename, "rb") as f:
            output_files[f"{filename}.{output_format}"] = f.read()

    return output_files

@app.local_entrypoint()
def main():
    outputs = process_cdr_files.remote(REPLACEMENT_JOBS, output_format="pdf")
    os.makedirs("output", exist_ok=True)
    for name, content in outputs.items():
        with open(f"output/{name}", "wb") as f:
            f.write(content)
        print(f"Saved: output/{name}")
