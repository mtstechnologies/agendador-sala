#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const reqPath = resolve(root, 'DOCUMENTO-DE-ESPECIFICAÇÃO-DE-REQUISITOS.md');
const usPath = resolve(root, 'Histórias-de-Usuário.md');

function extractRFCodes(text) {
  // Captura padrões RF-<ALFANUM+HÍFENES>
  const re = /\bRF-[A-Z0-9-]+\b/g;
  const set = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    set.add(m[0]);
  }
  return set;
}

function main() {
  try {
    const reqText = readFileSync(reqPath, 'utf8');
    const usText = readFileSync(usPath, 'utf8');

    const reqRF = extractRFCodes(reqText);
    const usRF = extractRFCodes(usText);

    const missing = Array.from(usRF).filter(code => !reqRF.has(code)).sort();

    console.log('Requisitos (documento):', Array.from(reqRF).sort().join(', ') || '(nenhum encontrado)');
    console.log('Requisitos (histórias):', Array.from(usRF).sort().join(', ') || '(nenhum encontrado)');

    if (missing.length > 0) {
      console.error(`\nERRO: ${missing.length} código(s) RF-* referenciados nas histórias não existem no documento de requisitos:`);
      missing.forEach(c => console.error(' -', c));
      process.exit(1);
    }

    console.log('\nOK: Todas as referências RF-* nas histórias existem no documento de requisitos.');
  } catch (err) {
    console.error('Falha ao executar lint de docs:', err.message);
    process.exit(2);
  }
}

main();
