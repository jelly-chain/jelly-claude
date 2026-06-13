#!/usr/bin/env node
/**
 * register-sdks.mjs — Register all SDKs from SDK-main into JellyClaude
 * 
 * Usage: node scripts/register-sdks.mjs [sdk-path]
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

const SDK_DIR = process.argv[2] || join(process.cwd(), '..', 'SDK-main');
const CONFIG_DIR = join(process.cwd(), 'config');
const REGISTRY_FILE = join(CONFIG_DIR, 'sdk-registry.json');

console.log('🔍 Scanning for SDKs in:', SDK_DIR);

// Load existing registry
let registry = { sdks: {} };
if (existsSync(REGISTRY_FILE)) {
  try {
    registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (e) {
    console.warn('⚠️  Could not parse existing registry, creating new one');
  }
}

// Scan for SDKs
const entries = readdirSync(SDK_DIR);
let newCount = 0;
let updateCount = 0;

for (const entry of entries) {
  const sdkPath = join(SDK_DIR, entry);
  const pkgPath = join(sdkPath, 'package.json');
  
  if (!statSync(sdkPath).isDirectory()) continue;
  if (!existsSync(pkgPath)) continue;
  
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const sdkName = entry.replace(/-sdk$/, '').replace(/-main$/, '');
    
    // Check if already registered
    if (registry.sdks[sdkName]) {
      // Update version
      registry.sdks[sdkName].version = pkg.version || '1.0.0';
      updateCount++;
    } else {
      // Register new SDK
      registry.sdks[sdkName] = {
        path: `../SDK-main/${entry}`,
        version: pkg.version || '1.0.0',
        category: detectCategory(entry),
        priority: detectPriority(entry),
        requiresKey: detectRequiresKey(sdkPath),
        keyEnv: detectKeyEnv(sdkPath),
        capabilities: detectCapabilities(sdkPath),
        description: pkg.description || ''
      };
      newCount++;
      console.log(`  ✅ Registered: ${sdkName} (${pkg.version})`);
    }
  } catch (e) {
    console.warn(`  ⚠️  Skipped: ${entry} (${e.message})`);
  }
}

// Write registry
writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
console.log(`\n📊 Summary: ${newCount} new, ${updateCount} updated, ${Object.keys(registry.sdks).length} total`);

function detectCategory(name) {
  if (name.includes('polymarket') || name.includes('kalshi') || name.includes('betfair') || name.includes('political') || name.includes('prediction-protocol')) return 'prediction-market';
  if (name.includes('sportradar') || name.includes('espn') || name.includes('weather') || name.includes('events')) return 'data-provider';
  if (name.includes('metaculus') || name.includes('manifold')) return 'forecasting';
  if (name.includes('esports') || name.includes('cricket')) return 'sport-specific';
  if (name.includes('line-movement') || name.includes('social-sentiment')) return 'analytics';
  return 'other';
}

function detectPriority(name) {
  if (name.includes('sportradar') || name.includes('polymarket-clob')) return 'P0';
  if (name.includes('kalshi-v3') || name.includes('metaculus') || name.includes('esports')) return 'P1';
  if (name.includes('betfair') || name.includes('cricket') || name.includes('weather') || name.includes('line-movement')) return 'P2';
  return 'P3';
}

function detectRequiresKey(sdkPath) {
  const envExample = join(sdkPath, '.env.example');
  if (!existsSync(envExample)) return false;
  const content = readFileSync(envExample, 'utf8');
  return content.includes('API_KEY=') || content.includes('TOKEN=') || content.includes('SECRET=');
}

function detectKeyEnv(sdkPath) {
  const envExample = join(sdkPath, '.env.example');
  if (!existsSync(envExample)) return null;
  const content = readFileSync(envExample, 'utf8');
  const match = content.match(/^([A-Z_]+(?:API_KEY|TOKEN|SECRET))=/m);
  return match ? match[1] : null;
}

function detectCapabilities(sdkPath) {
  const caps = [];
  const srcDir = join(sdkPath, 'src');
  if (!existsSync(srcDir)) return caps;
  
  const files = readdirSync(srcDir);
  if (files.some(f => f.includes('client'))) caps.push('api-client');
  if (files.some(f => f.includes('adapter'))) caps.push('data-normalization');
  if (files.some(f => f.includes('cache'))) caps.push('caching');
  if (files.some(f => f.includes('prediction'))) caps.push('predictions');
  
  const skillsDir = join(sdkPath, 'skills');
  if (existsSync(skillsDir)) caps.push('agent-skill');
  
  return caps;
}
