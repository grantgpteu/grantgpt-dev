import re
import os

DESIGN_GUIDELINES = "memory-bank/design-guidelines.md"
THEME_DIR = "web/tailwind-themes/custom/grantgpt"
TAILWIND_CONFIG = os.path.join(THEME_DIR, "tailwind.config.js")
THEME_CSS = os.path.join(THEME_DIR, "index.css")
GLOBAL_CSS = "web/src/app/globals.css"

COLOR_MAPPING = {
    "Primary": "primary",
    "Secondary": "secondary",
    "Background": "background",
    "Text Primary": "text-primary",
    "Lavender Purple": "lavender",
    "Teal": "teal",
    "Text Secondary": "text-secondary",
    "Text Subtitle": "text-subtitle",
    "Text Highlight": "text-highlight",
}


def extract_colors(design_guidelines_file):
    colors = {}
    with open(design_guidelines_file, "r") as f:
        content = f.read()

    # Extract main brand colors
    main_colors_match = re.search(
        r"### Main Brand Colors\n([\s\S]*?)###", content
    )
    if main_colors_match:
        main_colors_text = main_colors_match.group(1)
        for line in main_colors_text.splitlines():
            if line.strip():
                name_match = re.match(r"- (.*?): `(.*?)`", line)
                if name_match:
                    color_name = name_match.group(1).strip()
                    hex_code = name_match.group(2).strip()
                    if color_name in COLOR_MAPPING:
                        colors[COLOR_MAPPING[color_name]] = hex_code

    # Extract additional brand colors
    additional_colors_match = re.search(
        r"### Additional Brand Colors\n([\s\S]*?)###", content
    )
    if additional_colors_match:
        additional_colors_text = additional_colors_match.group(1)
        for line in additional_colors_text.splitlines():
            if line.strip():
                name_match = re.match(r"- (.*?): `(.*?)`", line)
            if name_match:
                color_name = name_match.group(1).strip()
                hex_code = name_match.group(2).strip()
                if color_name in COLOR_MAPPING:
                    colors[COLOR_MAPPING[color_name]] = hex_code

    return colors


def generate_css_variables(colors):
    css_content = ""
    css_content += ":root {\n"
    for name, hex_code in colors.items():
        css_content += f"  --color-{name}: {hex_code};\n"
    css_content += "}\n\n"

    css_content += ".dark {\n"
    # Add dark mode color overrides here, using lighter/darker shades
    # For now, just use the same colors
    for name, hex_code in colors.items():
        css_content += f"  --color-{name}: {hex_code};\n"
    css_content += "}\n"
    return css_content


def generate_tailwind_config():
    config_content = f"""
/** @type {{import('tailwindcss').Config}} */
module.exports = {{
  theme: {{
    extend: {{
      colors: {{
        'grantgpt-primary': 'var(--color-primary)',
        'grantgpt-secondary': 'var(--color-secondary)',
        'grantgpt-background': 'var(--color-background)',
        'grantgpt-text-primary': 'var(--color-text-primary)',
        'grantgpt-lavender': 'var(--color-lavender)',
        'grantgpt-teal': 'var(--color-teal)',
        'grantgpt-text-secondary': 'var(--color-text-secondary)',
        'grantgpt-text-subtitle': 'var(--color-text-subtitle)',
        'grantgpt-text-highlight': 'var(--color-text-highlight)',
      }},
    }},
  }},
  plugins: [],
}}
"""
    return config_content


def update_global_css():
    # Define the correct relative path from GLOBAL_CSS to the theme CSS
    # correct_relative_path = "../../tailwind-themes/custom/grantgpt/index.css"
    # Use double quotes for the import statement
    # import_statement = f'@import "{correct_relative_path}";'

    # --- DIAGNOSTIC STEP ---
    # Prepend a simple comment instead of the import
    import_statement = "/* Theme Import Placeholder */"
    # --- END DIAGNOSTIC STEP ---

    with open(GLOBAL_CSS, "r") as f:
        content = f.read()

    if import_statement not in content:
        # Prepend the import statement to the beginning of the file
        new_content = import_statement + "\\n" + content
        with open(GLOBAL_CSS, "w") as f:
            f.write(new_content)
        print(f"Added import statement to {GLOBAL_CSS}")
    else:
        print(f"Import statement already exists in {GLOBAL_CSS}")


def main():
    os.makedirs(THEME_DIR, exist_ok=True)

    colors = extract_colors(DESIGN_GUIDELINES)
    css_variables = generate_css_variables(colors)
    with open(THEME_CSS, "w") as f:
        f.write(css_variables)

    tailwind_config = generate_tailwind_config()
    with open(TAILWIND_CONFIG, "w") as f:
        f.write(tailwind_config)

    # Pass no argument as it's now hardcoded inside
    update_global_css()


if __name__ == "__main__":
    main()
