import { readdir, readFile, writeFile, stat, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively finds all .js files in a directory
 */
async function findJsFiles(dir, fileList = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      await findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Fixes import statements by adding .js extension to relative imports
 */
function fixImports(content) {
  // Match relative imports: from './path' or from '../path' or from './path.js' or from '../path.js'
  // This regex matches:
  // - import ... from './path'
  // - import ... from '../path'
  // - import ... from './path.js' (already has extension, skip)
  // - import ... from '../path.js' (already has extension, skip)
  const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;

  return content.replace(importRegex, (match, importPath) => {
    // Skip if already has .js extension or is importing a directory/index
    if (importPath.endsWith('.js') || importPath.endsWith('/')) {
      return match;
    }

    // Add .js extension
    return match.replace(importPath, `${importPath}.js`);
  });
}

/**
 * Copies JSON files and other non-TypeScript assets to dist folder
 */
async function copyAssets() {
  const srcPath = join(__dirname, '..', 'src');
  const distPath = join(__dirname, '..', 'dist');

  try {
    // Copy usersData.json from src/db to dist/db
    const srcJsonPath = join(srcPath, 'db', 'usersData.json');
    const distDbPath = join(distPath, 'db');
    const distJsonPath = join(distDbPath, 'usersData.json');

    // Ensure dist/db directory exists
    await mkdir(distDbPath, { recursive: true });

    // Copy the JSON file
    await copyFile(srcJsonPath, distJsonPath);
    console.log(`✓ Copied usersData.json to dist/db/`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('Warning: usersData.json not found in src/db, skipping copy');
    } else {
      console.error('Error copying assets:', error);
      throw error;
    }
  }
}

/**
 * Main function to fix all imports in dist folder
 */
async function main() {
  const distPath = join(__dirname, '..', 'dist');

  try {
    // First, copy assets (JSON files, etc.)
    await copyAssets();

    // Then fix imports
    const jsFiles = await findJsFiles(distPath);

    if (jsFiles.length === 0) {
      console.log('No .js files found in dist folder');
      return;
    }

    console.log(`Found ${jsFiles.length} .js file(s) to process...`);

    let fixedCount = 0;

    for (const filePath of jsFiles) {
      const content = await readFile(filePath, 'utf-8');
      const fixedContent = fixImports(content);

      if (content !== fixedContent) {
        await writeFile(filePath, fixedContent, 'utf-8');
        console.log(`✓ Fixed imports in: ${filePath.replace(process.cwd(), '.')}`);
        fixedCount++;
      }
    }

    if (fixedCount === 0) {
      console.log('All imports already have .js extensions');
    } else {
      console.log(`\n✓ Fixed imports in ${fixedCount} file(s)`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: dist folder does not exist');
    } else {
      console.error('Error fixing imports:', error);
    }
    process.exit(1);
  }
}

main();

