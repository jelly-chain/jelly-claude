#!/usr/bin/env node
/**
 * modules/audit/roast.mjs
 * Roast a file or directory for questionable code choices.
 * Because every codebase deserves to be insulted.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import chalk from 'chalk';

const INSULTS = [
  "This variable name says a lot about your life choices.",
  "I've seen better architecture from a drunk octopus.",
  "Your code is like a broken pencil — pointless.",
  "This looks like it was written during a power outage.",
  "Did you let a raccoon type this?",
  "This function violates the Geneva Conventions.",
  "I can see why you're single — your code is emotionally unavailable.",
  "This isn't technical debt, it's technical bankruptcy.",
  "The only thing shorter than this function's lifespan is its error handling.",
  "This code smells worse than a gym sock in a landfill.",
  "I wouldn't touch this code with a ten-foot pole — and I'm an AI.",
  "Congratulations, you've invented a new way to fail.",
  "This code is held together by duct tape and wishful thinking.",
  "I've seen more structure in a bowl of oatmeal.",
  "This function has more holes than a slice of Swiss cheese.",
];

const CODE_SMELLS = [
  { pattern: /var\s+\w+/g, message: "Using 'var' in 2025? How retro." },
  { pattern: /console\.log\("error"\)/gi, message: "That's not error handling, that's giving up." },
  { pattern: /await\s*\w+\s*\?\s*\w+\s*:\s*\w+/g, message: "Ternary await chain — the pinnacle of unreadable code." },
  { pattern: /'\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/'/g, message: "Path traversal that would make a spelunker jealous." },
  { pattern: /process\.env\.\w+/g, message: "Direct env access without validation — brave." },
  { pattern: /catch\s*\(\)\s*\{\}/g, message: "Silent catch block — the digital equivalent of ignoring problems." },
  { pattern: /\.then\([^}]*=>\s*\{[^}]*\.\.\.([^}]*)\}/g, message: "Callback hell called, it wants its indentation back." },
  { pattern: /\/\/\s*todo/gi, message: "TODO comment in production code — future you is crying." },
  { pattern: /\.filter\(.*\)\.map\(.*\)\.filter\(.*\)\.map\(/g, message: "That's not functional programming, that's functional masochism." },
];

function getRandomInsult() {
  return INSULTS[Math.floor(Math.random() * INSULTS.length)];
}

function analyzeFile(filepath) {
  const results = [];
  try {
    const content = readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const smell of CODE_SMELLS) {
        if (smell.pattern.test(line)) {
          results.push({
            file: filepath,
            line: i + 1,
            message: smell.message,
            code: line.trim().substring(0, 80),
          });
        }
      }
    }
  } catch (err) {
    results.push({ file: filepath, error: err.message });
  }
  return results;
}

function scanDirectory(dir, extensions = ['.js', '.mjs', '.ts', '.jsx', '.tsx']) {
  const results = [];
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    try {
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        if (!['node_modules', '.git', 'bundled', 'logs', 'dist'].includes(entry)) {
          results.push(...scanDirectory(fullPath, extensions));
        }
      } else if (stats.isFile() && extensions.includes(extname(entry))) {
        results.push(...analyzeFile(fullPath));
      }
    } catch {
      // Skip files we can't access
    }
  }
  
  return results;
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.log(chalk.red('Usage: node roast.mjs <file-or-directory>'));
    process.exit(1);
  }

  console.log(chalk.magenta('\n  🔥 Roast Mode Activated 🔥\n'));

  const targetPath = join(process.cwd(), target);
  const results = statSync(targetPath).isDirectory() 
    ? scanDirectory(targetPath) 
    : analyzeFile(targetPath);

  if (results.length === 0) {
    console.log(chalk.green('  No code smells detected. Shocked.'));
    console.log(chalk.dim(`  ${getRandomInsult()}\n`));
    return;
  }

  for (const r of results) {
    if (r.error) {
      console.log(chalk.yellow(`  ⚠ ${r.file}: ${r.error}`));
    } else {
      console.log(chalk.red(`  🤢 ${r.file}:${r.line}`));
      console.log(chalk.yellow(`     ${r.message}`));
      console.log(chalk.dim(`     ${r.code}`));
      console.log();
    }
  }

  console.log(chalk.magenta(`  Roast complete. ${results.length} issues found.`));
  console.log(chalk.white(`  ${getRandomInsult()}\n`));
}

main().catch(console.error);