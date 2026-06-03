// ============================================================
// ETNAir — K6 Load Test (test de charge complet)
// Utilisation : k6 run k6/load-test.js
// Utilisation avec variables : k6 run --env BASE_URL=http://api.etnair.com k6/load-test.js
import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Counter, Gauge, Rate, Trend } from 'k6/metrics'
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Métriques custom
const bookingCreated  = new Counter('bookings_created')
const bookingFailed   = new Counter('bookings_failed')
const errorRate       = new Rate('error_rate')
const searchLatency   = new Trend('search_latency_ms', true)
const loginLatency    = new Trend('login_latency_ms', true)

export const options = {
  // Scénario : montée en charge progressive
  stages: [
    { duration: '30s', target: 5   }, // Warm-up : 0 → 5 VUs
    { duration: '1m',  target: 20  }, // Charge normale : 20 VUs
    { duration: '30s', target: 50  }, // Pic de charge : 50 VUs
    { duration: '1m',  target: 50  }, // Maintien du pic
    { duration: '30s', target: 0   }, // Descente
  ],
  thresholds: {
    http_req_failed:   ['rate<0.05'],     // < 5% d'erreurs
    http_req_duration: ['p(95)<3000'],    // p95 < 3s
    http_req_duration: ['p(99)<5000'],    // p99 < 5s
    search_latency_ms: ['p(90)<1000'],    // Recherche < 1s au p90
    login_latency_ms:  ['p(90)<2000'],    // Login < 2s au p90
    error_rate:        ['rate<0.1'],      // < 10% d'erreurs custom
  },
}

const HEADERS = { 'Content-Type': 'application/json' }

// Scénarios utilisateurs
function scenarioGuest() {
  group('🔍 Visiteur — navigation', () => {
    // Accueil
    const homeRes = http.get(`${BASE_URL}/annonces?limit=6`)
    check(homeRes, { 'home : 200': r => r.status === 200 })

    sleep(randomIntBetween(1, 3))

    // Recherche par ville
    const cities = ['Paris', 'Lyon', 'Bordeaux', 'Nice', 'Marseille']
    const city = cities[randomIntBetween(0, cities.length - 1)]
    const start = Date.now()
    const searchRes = http.get(`${BASE_URL}/annonces?city=${city}&limit=9`)
    searchLatency.add(Date.now() - start)

    const searchOk = check(searchRes, {
      'search : 200':           r => r.status === 200,
      'search : is array':      r => Array.isArray(JSON.parse(r.body)),
      'search : latency < 2s':  r => r.timings.duration < 2000,
    })
    errorRate.add(!searchOk)

    sleep(randomIntBetween(1, 2))

    // Détail d'une annonce
    const id = randomIntBetween(1, 8)
    const detailRes = http.get(`${BASE_URL}/annonces/${id}`)
    check(detailRes, {
      'detail : 200 or 404': r => [200, 404].includes(r.status),
    })
  })
}

function scenarioAuthUser() {
  group('👤 Utilisateur — login + réservation', () => {
    // Login
    const loginStart = Date.now()
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email:    'oliver.davis@email.com',
      password: 'password',
    }), { headers: HEADERS })
    loginLatency.add(Date.now() - loginStart)

    const loginOk = check(loginRes, {
      'login : 200':       r => r.status === 200,
      'login : has token': r => !!JSON.parse(r.body)?.token,
    })
    errorRate.add(!loginOk)

    if (!loginOk) return

    const { token } = JSON.parse(loginRes.body)
    const authHeaders = { ...HEADERS, Authorization: `Bearer ${token}` }

    sleep(randomIntBetween(1, 2))

    // Voir ses réservations
    const bookingsRes = http.get(`${BASE_URL}/bookings`, { headers: authHeaders })
    check(bookingsRes, { 'bookings : 200': r => r.status === 200 })

    sleep(randomIntBetween(1, 3))

    // Créer une réservation
    const today = new Date()
    const startDate = new Date(today.setDate(today.getDate() + randomIntBetween(10, 60)))
    const endDate   = new Date(startDate)
    endDate.setDate(endDate.getDate() + randomIntBetween(2, 5))

    const bookRes = http.post(`${BASE_URL}/bookings`, JSON.stringify({
      property_id: randomIntBetween(1, 6),
      start_date:  startDate.toISOString().split('T')[0],
      end_date:    endDate.toISOString().split('T')[0],
    }), { headers: authHeaders })

    if (check(bookRes, { 'booking : 201': r => r.status === 201 })) {
      bookingCreated.add(1)
    } else {
      bookingFailed.add(1)
    }
  })
}

export default function () {
  // 70% visiteurs anonymes, 30% utilisateurs connectés
  if (Math.random() < 0.7) {
    scenarioGuest()
  } else {
    scenarioAuthUser()
  }
  sleep(randomIntBetween(1, 3))
}

export function handleSummary(data) {
  const dur   = data.metrics.http_req_duration?.values
  const fail  = data.metrics.http_req_failed?.values
  const iters = data.metrics.iterations?.values

  console.log('\n📊 ETNAir Load Test — Rapport Final')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔁 Itérations     : ${iters?.count || 0}`)
  console.log(`❌ Taux d'erreurs : ${((fail?.rate || 0) * 100).toFixed(2)}%`)
  console.log(`⏱  Latence moyenne : ${(dur?.avg || 0).toFixed(0)}ms`)
  console.log(`⏱  Latence p90     : ${(dur?.['p(90)'] || 0).toFixed(0)}ms`)
  console.log(`⏱  Latence p95     : ${(dur?.['p(95)'] || 0).toFixed(0)}ms`)
  console.log(`⏱  Latence p99     : ${(dur?.['p(99)'] || 0).toFixed(0)}ms`)
  console.log(`📅 Réservations créées : ${data.metrics.bookings_created?.values?.count || 0}`)
  console.log(`📅 Réservations échouées : ${data.metrics.bookings_failed?.values?.count || 0}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return {}
}
