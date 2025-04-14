import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Project, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

// --- Path Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..'); // Assumes script is in scripts/dist

const iconsFilePath = path.join(projectRoot, 'web', 'src', 'components', 'icons', 'icons.tsx');
const grantGptSvgPath = path.join(projectRoot, 'web', 'public', 'logo.svg');
const fixedLogoPath = path.join(projectRoot, 'web', 'src', 'components', 'logo', 'FixedLogo.tsx');

console.log(`Script directory (__dirname): ${__dirname}`);
console.log(`Calculated project root: ${projectRoot}`);
console.log(`Processing icons file: ${iconsFilePath}`);
console.log(`Using GrantGPT SVG file: ${grantGptSvgPath}`);
console.log(`Processing FixedLogo file: ${fixedLogoPath}`);

// --- Replacement Content ---
const logoTypeReplacementJsx = `<span style={{ fontSize: size ? Math.floor(size/5) + "px" : "1rem", fontWeight: "bold" }} className={className}>GrantGPT</span>`;

async function main() {
  try {
    // --- Read Input Files ---
    if (!fs.existsSync(iconsFilePath)) throw new Error(`icons.tsx not found: ${iconsFilePath}`);
    if (!fs.existsSync(grantGptSvgPath)) throw new Error(`logo.svg not found: ${grantGptSvgPath}`);
    if (!fs.existsSync(fixedLogoPath)) throw new Error(`FixedLogo.tsx not found: ${fixedLogoPath}`);

    const grantGptSvgContent = fs.readFileSync(grantGptSvgPath, 'utf8');
    let fixedLogoContent = fs.readFileSync(fixedLogoPath, 'utf8');

    // --- Extract SVG Content ---
    const svgContentMatch = grantGptSvgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (!svgContentMatch || !svgContentMatch[1]) throw new Error('Could not extract content from GrantGPT SVG file.');
    const grantGptInnerSvg = svgContentMatch[1].trim();
    // Simple escaping for template literal insertion (adjust if needed for complex SVGs)
    const escapedGrantGptInnerSvg = grantGptInnerSvg.replace(/`/g, '\\`').replace(/\${/g, '\\${');
    console.log("Successfully extracted GrantGPT SVG paths.");

    // --- Initialize ts-morph Project ---
    const project = new Project({
        // Optionally configure compiler options if needed, but usually inherits from tsconfig.json
        // compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, // Example if JSX parsing needs help
    });

    // --- Process icons.tsx ---
    const sourceFile = project.addSourceFileAtPath(iconsFilePath);

    // 1. Replace OnyxIcon SVG content
    const onyxIconDeclaration = sourceFile.getVariableDeclaration('OnyxIcon');
    if (onyxIconDeclaration) {
        const arrowFunction = onyxIconDeclaration.getInitializerIfKind(SyntaxKind.ArrowFunction);
        if (arrowFunction) {
            const returnStatement = arrowFunction.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
            if (returnStatement) {
                const jsxElement = returnStatement.getExpressionIfKind(SyntaxKind.ParenthesizedExpression)
                                     ?.getExpressionIfKind(SyntaxKind.JsxElement); // Handle potential parentheses
                if (jsxElement) {
                    // Replace children of the <svg> tag
                    jsxElement.setBodyText(`\n        ${escapedGrantGptInnerSvg}\n      `);
                    console.log("Replaced OnyxIcon SVG content using AST.");
                } else {
                     console.warn("Could not find JsxElement within OnyxIcon return statement.");
                }
            } else {
                 console.warn("Could not find return statement in OnyxIcon.");
            }
        } else {
             console.warn("OnyxIcon variable initializer is not an arrow function.");
        }
    } else {
        console.warn("OnyxIcon variable declaration not found.");
    }

    // 2. Replace OnyxLogoTypeIcon's returned JSX
    const onyxLogoTypeDeclaration = sourceFile.getVariableDeclaration('OnyxLogoTypeIcon');
    if (onyxLogoTypeDeclaration) {
        const arrowFunction = onyxLogoTypeDeclaration.getInitializerIfKind(SyntaxKind.ArrowFunction);
        if (arrowFunction) {
            const returnStatement = arrowFunction.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
            if (returnStatement) {
                 const returnedExpr = returnStatement.getExpression(); // Get the node being returned
                 if (returnedExpr) {
                     // Check if the returned expression is directly a JsxElement (the span)
                     const spanElement = returnedExpr.asKind(SyntaxKind.JsxElement); 
                     if (spanElement) {
                         // Replace the JsxElement node itself
                         spanElement.replaceWithText(logoTypeReplacementJsx); 
                         console.log("Replaced OnyxLogoTypeIcon's returned JsxElement using AST.");
                     } else {
                          // If not a direct JsxElement, maybe it's parenthesized? (Handle original case just in case)
                          const parenthesizedSpan = returnedExpr.asKind(SyntaxKind.ParenthesizedExpression)
                                                     ?.getExpressionIfKind(SyntaxKind.JsxElement);
                          if (parenthesizedSpan) {
                             parenthesizedSpan.replaceWithText(logoTypeReplacementJsx);
                             console.log("Replaced OnyxLogoTypeIcon's parenthesized JsxElement using AST.");
                          } else {
                             console.warn(`OnyxLogoTypeIcon return expression was not a JsxElement or Parenthesized(JsxElement), but ${returnedExpr.getKindName()}. Skipping replacement.`);
                          }
                     }
                 } else {
                     console.warn("Could not get expression from return statement in OnyxLogoTypeIcon.");
                 }
            } else {
                 console.warn("Could not find return statement in OnyxLogoTypeIcon.");
            }
        } else {
             console.warn("OnyxLogoTypeIcon variable initializer is not an arrow function.");
        }
    } else {
        console.warn("OnyxLogoTypeIcon variable declaration not found.");
    }

    // Save the modified icons.tsx file
    await sourceFile.save();
    console.log(`Successfully updated ${iconsFilePath} using AST.`);

    // --- Process FixedLogo.tsx (using simple string replace still) ---
    const poweredByRegex = />\s*Powered by Onyx\s*</g;
    if (fixedLogoContent.match(poweredByRegex)) {
        fixedLogoContent = fixedLogoContent.replace(poweredByRegex, '>Powered by GrantGPT<');
        fs.writeFileSync(fixedLogoPath, fixedLogoContent, 'utf8');
        console.log(`Successfully updated "Powered by" text in ${fixedLogoPath}`);
    } else {
        console.warn(`"Powered by Onyx" text not found in ${fixedLogoPath}. It might have already been changed.`);
    }

  } catch (error) {
    console.error("Error during AST-based replacement:", error);
    process.exit(1);
  }
}

main();
