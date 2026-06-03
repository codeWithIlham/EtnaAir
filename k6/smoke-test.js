// ============================================================
// ETNAir — K6 Smoke Test (validation basique)
// Utilisation : k6 run k6/smoke-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Métriques custom
const loginErrors   = new Counter('login_errors')
const searchErrors  = new Counter('search_errors')
const errorRate     = new Rate('error_rate')
const apiLatency    = new Trend('api_latency', true)

export const options = {
  vus: 1,
  iterations: 10,
  thresholds: {
    http_req_failed:   ['rate<0.01'],          // < 1% erreurs
    http_req_duration: ['p(95)<2000'],          // p95 < 2s
    error_rate:        ['rate<0.05'],
  },
}

const headers = { 'Content-Type': 'application/json' }

export default function () {
  // Test 1 : Accès API
  const metricsRes = http.get(`${BASE_URL}/metrics`)
  check(metricsRes, {
    'GET /metrics : 200': r => r.status === 200,
  })

  // Test 2 : Liste des annonces
  const start = Date.now()
  const listRes = http.get(`${BASE_URL}/annonces`)
  apiLatency.add(Date.now() - start)

  const listOk = check(listRes, {
    'GET /annonces : 200':            r => r.status === 200,
    'GET /annonces : body is array':  r => Array.isArray(JSON.parse(r.body)),
    'GET /annonces : not empty':      r => JSON.parse(r.body).length > 0,
    'GET /annonces : latency < 1s':   r => r.timings.duration < 1000,
  })
  if (!listOk) searchErrors.add(1)
  errorRate.add(!listOk)

  // Test 3 : Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email:    'oliver.davis@email.com',
    password: 'password',
  }), { headers })

  const loginOk = check(loginRes, {
    'POST /auth/login : 200':           r => r.status === 200,
    'POST /auth/login : has token':     r => !!JSON.parse(r.body).token,
    'POST /auth/login : latency < 2s':  r => r.timings.duration < 2000,
  })
  if (!loginOk) loginErrors.add(1)

  // Test 4 : Détail annonce
  const detailRes = http.get(`${BASE_URL}/annonces/1`)
  check(detailRes, {
    'GET /annonces/1 : 200': r => r.status === 200,
    'GET /annonces/1 : has title': r => !!JSON.parse(r.body).title,
  })

  // Test 5 : Recherche filtrée
  const searchRes = http.get(`${BASE_URL}/annonces?city=Paris`)
  check(searchRes, {
    'GET /annonces?city=Paris : 200': r => r.status === 200,
  })

  sleep(0.5)
}

export function handleSummary(data) {
  console.log('\n📊 ETNAir Smoke Test Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Iterations : ${data.metrics.iterations?.values?.count || 0}`)
  console.log(`❌ HTTP errors : ${(data.metrics.http_req_failed?.values?.rate * 100).toFixed(2)}%`)
  console.log(`⏱  p95 latency : ${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(0)}ms`)
  return {}
}
