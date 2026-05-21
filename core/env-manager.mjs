// core/env-manager.mjs
// Environment configuration manager

import { homedir } from 'node:path';
import { existsSync, mkdirSync, chmodSync, readFileSync, writeFileSync } from 'node:fs';

const JELLY_HOME = process.env.JELLY_HOME || join(homedir(), '.jelly-claude');
const KEYS_FILE = join(JELLY_HOME, '.keys');
const ENV_FILE = join(process.cwd(), '.env');

export class EnvManager {
  constructor() {
    this.envVars = this.loadEnv();
    this.keys = this.loadKeys();
  }

  loadEnv() {
    if (!existsSync(ENV_FILE)) {
      return {};
    }
    const content = readFileSync(ENV_FILE, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
      if (line.includes('=')) {
        const [key, value] = line.split('=').map(s => s.trim());
        vars[key] = value;
      }
    });
    return vars;
  }

  loadKeys() {
    if (!existsSync(KEYS_FILE)) {
      return {};
    }
    const content = readFileSync(KEYS_FILE, 'utf8');
    const keys = {};
    content.split('\n').forEach(line => {
      if (line.includes('=')) {
        const [key, value] = line.split('=').map(s => s.trim());
        keys[key] = value;
      }
    });
    return keys;
  }

  /**
   * Generate .env from .env.example with auto-filled values from .keys
   */
  generateEnvFromExample() {
    const examplePath = join(process.cwd(), '.env.example');
    if (!existsSync(examplePath)) {
      throw new Error('.env.example not found');
    }

    const exampleContent = readFileSync(examplePath, 'utf8');
    const requiredKeys = this.extractKeysFromExample(exampleContent);
    const currentEnv = this.envVars;

    // Merge required keys with existing .env or .keys
    const mergedEnv = { ...currentEnv };
    requiredKeys.forEach(key => {
      if (!mergedEnv[key] && this.keys[key]) {
        mergedEnv[key] = this.keys[key];
      }
    });

    // Write .env file
    const envContent = Object.entries(mergedEnv)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    writeFileSync(ENV_FILE, envContent, 'utf8');
    chmodSync(ENV_FILE, 0o600);
  }

  extractKeysFromExample(content) {
    const keys = new Set();
    content.split('\n').forEach(line => {
      if (line.startsWith('#') || !line.includes('=')) return;
      const key = line.split('=')[0].trim();
      keys.add(key);
    });
    return Array.from(keys);
  }

  /**
   * Validate required environment variables
   */
  validate(requiredKeys) {
    const missing = [];
    for (const key of requiredKeys) {
      if (!this.envVars[key]) {
        missing.push(key);
      }
    }
    return missing;
  }

  /**
   * Backup existing .env file
   */
  backupEnv() {
    if (existsSync(ENV_FILE)) {
      const backupPath = `${ENV_FILE}.bak.${Date.now()}`;
      // Use shell command to preserve permissions
      const { execSync } = require('node:child_process');
      execSync(`cp "${ENV_FILE}" "${backupPath}" && chmod 600 "${backupPath}"`);
    }
  }

  /**
   * Auto-configure environment with user confirmation
   */
  async autoConfigure(confirm = true) {
    this.backupEnv();

    // Generate .env if missing
    if (!existsSync(ENV_FILE)) {
      this.generateEnvFromExample();
    }

    // Validate required keys
    const required = ['ANTHROPIC_API_KEY', 'OPENROUTER_API_KEY'];
    const missing = this.validate(required);

    if (missing.length > 0) {
      if (confirm) {
        console.warn(`Missing required API keys: ${missing.join(', ')}`);
        console.warn('Please add them to .env or run setup.sh again with --auto flag');
      }
      throw new Error(`Missing required API keys: ${missing.join(', ')}`);
    }

    console.log('✅ Environment auto-configured successfully');
    console.log(`\nEdit your .env at: ${ENV_FILE}`);
  }
}