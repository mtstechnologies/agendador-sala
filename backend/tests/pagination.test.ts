// Teste simples de contrato do endpoint /reservations (paginação)
// Observação: requer a API rodando localmente em PORT (default 4000).

import assert from 'node:assert'
import http from 'node:http'

function get(path: string): Promise<any> {
  const base = `http://localhost:${process.env.PORT || 4000}`
  return new Promise((resolve, reject) => {
    http.get(base + path, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8')
          const json = raw ? JSON.parse(raw) : undefined
          resolve(json)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

async function main() {
  const data = await get('/reservations?page=1&pageSize=1')
  assert.ok(data && typeof data === 'object', 'Resposta deve ser um objeto JSON')
  ;['items', 'page', 'pageSize', 'total', 'totalPages'].forEach((k) => {
    assert.ok(k in data, `Campo obrigatório ausente: ${k}`)
  })
  assert.ok(Array.isArray(data.items), 'items deve ser array')
  assert.strictEqual(typeof data.page, 'number', 'page deve ser number')
  assert.strictEqual(typeof data.pageSize, 'number', 'pageSize deve ser number')
  assert.strictEqual(typeof data.total, 'number', 'total deve ser number')
  assert.strictEqual(typeof data.totalPages, 'number', 'totalPages deve ser number')
  console.log('Contrato /reservations OK')
}

main().catch((e) => {
  console.error('Falha no teste de contrato:', e)
  process.exit(1)
})
