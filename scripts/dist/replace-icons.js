import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Project, SyntaxKind, Node } from 'ts-morph';

// --- Configuration ---
const CONFIG = {
  brandingChanges: {
    oldBrand: 'Onyx',
    newBrand: 'GrantGPT',
  },
  paths: {
    // These paths will be calculated relative to the project root
    iconsFile: ['web', 'src', 'components', 'icons', 'icons.tsx'],
    logoSvgFile: ['web', 'public', 'logo.svg'],
    fixedLogoFile: ['web', 'src', 'components', 'logo', 'FixedLogo.tsx'],
  },
  components: {
    iconName: 'OnyxIcon',
    logoTypeName: 'OnyxLogoTypeIcon',
    poweredByText: 'Powered by Onyx',
  },
};

// --- Path Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Adjust this if the script is not in scripts/dist
const projectRoot = path.resolve(__dirname, '..', '..');

// Build absolute paths
const getAbsolutePath = (pathSegments: string[]): string => 
  path.join(projectRoot, ...pathSegments);

const iconsFilePath = getAbsolutePath(CONFIG.paths.iconsFile);
const grantGptSvgPath = getAbsolutePath(CONFIG.paths.logoSvgFile);
const fixedLogoPath = getAbsolutePath(CONFIG.paths.fixedLogoFile);

// --- Logging Utilities ---
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  debug: (message: string) => console.log(`[DEBUG] ${message}`),
};

// Log configuration paths
logger.debug(`Script directory: ${__dirname}`);
logger.debug(`Project root: ${projectRoot}`);
logger.debug(`Icons file: ${iconsFilePath}`);
logger.debug(`Logo SVG file: ${grantGptSvgPath}`);
logger.debug(`FixedLogo file: ${fixedLogoPath}`);

// --- Replacement Content ---
const logoTypeReplacementJsx = `<span 
  style={{ 
    fontSize: size ? Math.floor(size/5) + "px" : "1rem", 
    fontWeight: "bold" 
  }} 
  className={className}
>
  ${CONFIG.brandingChanges.newBrand}
</span>`;

// --- Helper Functions ---
function checkFileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

function extractSvgContent(svgFile: string): string {
  const svgContent = fs.readFileSync(svgFile, 'utf8');
  
  // More robust SVG content extraction - looks for content between opening and closing svg tags
  const svgContentMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  
  if (!svgContentMatch || !svgContentMatch[1]) {
    throw new Error(`Could not extract content from SVG file: ${svgFile}`);
  }
  
  return svgContentMatch[1].trim();
}

function escapeForTemplateLiteral(text: string): string {
  return text
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

async function modifyIconsFile(
  filePath: string, 
  innerSvgContent: string
): Promise<void> {
  const project = new Project({});
  const sourceFile = project.addSourceFileAtPath(filePath);

  let successCount = 0;
  
  // 1. Replace SVG content in the icon component
  const iconDeclaration = sourceFile.getVariableDeclaration(CONFIG.components.iconName);
  if (!iconDeclaration) {
    throw new Error(`${CONFIG.components.iconName} variable declaration not found`);
  }

  try {
    const arrowFunction = iconDeclaration.getInitializerIfKind(SyntaxKind.ArrowFunction);
    if (!arrowFunction) {
      throw new Error(`${CONFIG.components.iconName} is not defined as an arrow function`);
    }

    const returnStatement = arrowFunction.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
    if (!returnStatement) {
      throw new Error(`Could not find return statement in ${CONFIG.components.iconName}`);
    }

    // Handle both direct JSX elements and parenthesized expressions
    let jsxElement = returnStatement.getExpressionIfKind(SyntaxKind.JsxElement);
    
    if (!jsxElement) {
      const parenthesized = returnStatement.getExpressionIfKind(SyntaxKind.ParenthesizedExpression);
      if (parenthesized) {
        jsxElement = parenthesized.getExpressionIfKind(SyntaxKind.JsxElement);
      }
    }

    if (!jsxElement) {
      throw new Error(`Could not find JSX element in return statement of ${CONFIG.components.iconName}`);
    }

    // Replace children of the <svg> tag
    jsxElement.setBodyText(`\n        ${escapeForTemplateLiteral(innerSvgContent)}\n      `);
    logger.info(`Successfully updated ${CONFIG.components.iconName} SVG content`);
    successCount++;
  } catch (error) {
    throw new Error(`Failed to update ${CONFIG.components.iconName}: ${error.message}`);
  }

  // 2. Replace Logo Type component
  const logoTypeDeclaration = sourceFile.getVariableDeclaration(CONFIG.components.logoTypeName);
  if (!logoTypeDeclaration) {
    throw new Error(`${CONFIG.components.logoTypeName} variable declaration not found`);
  }

  try {
    const arrowFunction = logoTypeDeclaration.getInitializerIfKind(SyntaxKind.ArrowFunction);
    if (!arrowFunction) {
      throw new Error(`${CONFIG.components.logoTypeName} is not defined as an arrow function`);
    }

    const returnStatement = arrowFunction.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
    if (!returnStatement) {
      throw new Error(`Could not find return statement in ${CONFIG.components.logoTypeName}`);
    }

    const returnedExpression = returnStatement.getExpression();
    if (!returnedExpression) {
      throw new Error(`Could not get expression from return statement in ${CONFIG.components.logoTypeName}`);
    }

    // Replace the entire node that was being returned with the new JSX text
    returnedExpression.replaceWithText(logoTypeReplacementJsx);
    logger.info(`Successfully updated ${CONFIG.components.logoTypeName} component`);
    successCount++;
  } catch (error) {
    throw new Error(`Failed to update ${CONFIG.components.logoTypeName}: ${error.message}`);
  }

  // Save changes
  await sourceFile.save();
  
  if (successCount === 2) {
    logger.info(`Successfully updated both components in ${filePath}`);
  } else {
    throw new Error(`Only ${successCount}/2 components were successfully updated in ${filePath}`);
  }
}

function modifyFixedLogoFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  const oldText = CONFIG.components.poweredByText;
  const newText = `Powered by ${CONFIG.brandingChanges.newBrand}`;
  
  // More precise regex to find the text while preserving whitespace
  const poweredByRegex = new RegExp(`>\\s*${oldText}\\s*<`, 'g');
  
  if (!content.match(poweredByRegex)) {
    throw new Error(`"${oldText}" text not found in ${filePath}`);
  }
  
  content = content.replace(poweredByRegex, `>${newText}<`);
  fs.writeFileSync(filePath, content, 'utf8');
  logger.info(`Successfully updated "Powered by" text in ${filePath}`);
}

// --- Main Function ---
async function main() {
  try {
    // Check if all required files exist
    logger.info("Checking file paths...");
    checkFileExists(iconsFilePath);
    checkFileExists(grantGptSvgPath);
    checkFileExists(fixedLogoPath);
    logger.info("All required files found");
    
    // Extract SVG content
    logger.info("Extracting SVG content...");
    const svgContent = extractSvgContent(grantGptSvgPath);
    logger.info("Successfully extracted SVG content");

    // Process files
    logger.info("Modifying icons file...");
    await modifyIconsFile(iconsFilePath, svgContent);
    
    logger.info("Modifying fixed logo file...");
    modifyFixedLogoFile(fixedLogoPath);
    
    logger.info("Rebranding completed successfully!");
  } catch (error) {
    logger.error(`Rebranding failed: ${error.message}`);
    process.exit(1);
  }
}

main();