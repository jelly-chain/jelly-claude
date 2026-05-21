// core/extensions.mjs
// Extension loader for Jelly ecosystem

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(import.meta.url, '..');

export class ExtensionLoader {
  constructor(configPath = 'config/extensions.json') {
    this.configPath = configPath;
    this.extensions = {};
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configFile = join(process.cwd(), this.configPath);
    if (!existsSync(configFile)) {
      console.warn(`Extension config not found: ${configFile}`);
      return { extensions: [] };
    }
    const config = JSON.parse(readFileSync(configFile, 'utf8'));
    return config;
  }

  /**
   * Load all enabled extensions
   */
  loadExtensions() {
    const extensions = this.config.extensions || [];
    const results = [];

    for (const ext of extensions) {
      const extPath = join(process.cwd(), ext.path);
      if (!existsSync(extPath)) {
        console.warn(`Extension not found: ${ext.name} at ${ext.path}`);
        continue;
      }

      try {
        // Load extension entry point
        const entryPath = join(extPath, 'index.js');
        if (existsSync(entryPath)) {
          const extension = await import(entryPath);
          if (extension.default) {
            this.extensions[ext.name] = extension.default;
            results.push({ name: ext.name, status: 'loaded', path: ext.path });
          }
        } else if (existsSync(join(extPath, 'setup.js'))) {
          // Legacy extension
          const { setup } = await import(join(extPath, 'setup.js'));
          await setup();
          results.push({ name: ext.name, status: 'loaded', path: extPath });
        } else {
          console.warn(`No entry point found for extension: ${ext.name}`);
          results.push({ name: ext.name, status: 'missing-entry', path: extPath });
        }
      } catch (error) {
        console.warn(`Failed to load extension ${ext.name}:`, error.message);
        results.push({ name: ext.name, status: 'error', error: error.message, path: extPath });
      }
    }

    return results;
  }

  /**
   * Get extension by name
   */
  getExtension(name) {
    return this.extensions[name];
  }

  /**
   * List all loaded extensions
   */
  listExtensions() {
    return Object.keys(this.extensions);
  }
}

// Auto-load extensions when this module is required via -r flag
// This runs when the module is imported, which happens when using `node -r ./core/extensions.mjs`
(async () => {
  try {
    const loader = new ExtensionLoader();
    const results = await loader.loadExtensions();
    // Log any errors or warnings
    for (const result of results) {
      if (result.status === 'error') {
        console.warn(`Extension ${result.name} failed to load:`, result.error);
      } else if (result.status === 'missing-entry') {
        console.warn(`Extension ${result.name} has no entry point.`);
      }
    }
  } catch (err) {
    console.error('Failed to load extensions:', err);
  }
})();