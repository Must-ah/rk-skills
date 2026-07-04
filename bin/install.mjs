#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsSrc = join(pkgRoot, 'skills');

if (!existsSync(skillsSrc)) {
	console.error('rk-skills: could not find the skills/ directory in the package.');
	process.exit(1);
}

// Each skill is a directory under skills/ that contains a SKILL.md.
const skills = readdirSync(skillsSrc, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)
	.filter((name) => existsSync(join(skillsSrc, name, 'SKILL.md')))
	.sort();

if (skills.length === 0) {
	console.error('rk-skills: no skills found to install.');
	process.exit(1);
}

const project = process.argv.includes('--project');
const skillsDir = project
	? join(process.cwd(), '.claude', 'skills')
	: join(homedir(), '.claude', 'skills');

mkdirSync(skillsDir, { recursive: true });
for (const name of skills) {
	cpSync(join(skillsSrc, name), join(skillsDir, name), { recursive: true });
}

const scope = project ? 'this project' : 'your personal skills';
console.log(`rk-skills installed ${skills.length} skills into ${scope}:`);
console.log(`  ${skillsDir}`);
console.log(`  ${skills.join(', ')}`);
console.log('\nRestart Claude Code (or start a new session), then invoke any skill by name, e.g.\n  /fableplan <task to plan>');
