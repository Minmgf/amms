/**
 * K6 Load Test Script para AMMS
 * 
 * Este script prueba los endpoints críticos del sistema:
 * - Autenticación (login)
 * - Lista de maquinaria
 * - Lista de solicitudes
 * - Mantenimientos programados
 * 
 * Escenarios:
 * - Smoke Test: 1-5 VUs por 1 minuto
 * - Load Test: 10-50 VUs por 5 minutos
 * - Stress Test: 50-100 VUs por 3 minutos
 * 
 * Uso:
 * k6 run --out json=results.json k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiResponseTime = new Trend('api_response_time');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Configuración de APIs
const BASE_URL_USERS = 'https://api.inmero.co/sigma/users';
const BASE_URL_MAIN = 'https://api.inmero.co/sigma/main';

// Credenciales de prueba
const TEST_EMAIL = 'nicourrutia83@gmail.com';
const TEST_PASSWORD = '@Nico9812.784';

// Configuración de escenarios
export const options = {
  scenarios: {
    // Smoke Test: Validar funcionalidad básica
    smoke: {
      executor: 'constant-vus',
      vus: 2,
      duration: '1m',
      tags: { test_type: 'smoke' },
      exec: 'smokeTest',
    },
    
    // Load Test: Carga normal esperada
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },  // Ramp up
        { duration: '3m', target: 50 },  // Stay at 50
        { duration: '1m', target: 0 },   // Ramp down
      ],
      tags: { test_type: 'load' },
      exec: 'loadTest',
      startTime: '1m', // Empezar después del smoke test
    },
    
    // Stress Test: Identificar punto de quiebre
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'stress' },
      exec: 'stressTest',
      startTime: '6m', // Empezar después del load test
    },
  },
  
  thresholds: {
    // Umbrales de aceptación
    'http_req_duration': ['p(95)<500'], // 95% de las peticiones deben ser < 500ms
    'http_req_failed': ['rate<0.05'],   // Menos del 5% de errores
    'errors': ['rate<0.05'],
    'login_duration': ['p(95)<2000'],    // Login < 2s en el 95% de casos
    'api_response_time': ['p(95)<1000'], // APIs < 1s en el 95% de casos
  },
};

// Función auxiliar para login
function performLogin() {
  const loginPayload = JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  
  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'LoginRequest' },
  };
  
  const loginStart = Date.now();
  const loginRes = http.post(
    `${BASE_URL_USERS}/auth/login/`,
    loginPayload,
    loginParams
  );
  
  const loginTime = Date.now() - loginStart;
  loginDuration.add(loginTime);
  
  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns access_token': (r) => r.json('access_token') !== undefined,
  });
  
  if (!loginSuccess) {
    errorRate.add(1);
    failedRequests.add(1);
    console.error(`Login failed: ${loginRes.status} - ${loginRes.body}`);
    return null;
  }
  
  successfulRequests.add(1);
  return loginRes.json('access_token');
}

// Función auxiliar para hacer peticiones autenticadas
function makeAuthenticatedRequest(endpoint, token, baseUrl = BASE_URL_MAIN) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  
  const start = Date.now();
  const res = http.get(`${baseUrl}${endpoint}`, params);
  const duration = Date.now() - start;
  
  apiResponseTime.add(duration);
  
  const success = check(res, {
    [`${endpoint} status is 200`]: (r) => r.status === 200,
    [`${endpoint} has data`]: (r) => r.body && r.body.length > 0,
  });
  
  if (!success) {
    errorRate.add(1);
    failedRequests.add(1);
  } else {
    successfulRequests.add(1);
  }
  
  return res;
}

// Smoke Test: Validar que los endpoints funcionan
export function smokeTest() {
  const token = performLogin();
  
  if (!token) {
    console.error('Smoke test failed: unable to login');
    return;
  }
  
  sleep(1);
  
  // Probar endpoints críticos
  makeAuthenticatedRequest('/machines/?page=1&page_size=10', token);
  sleep(1);
  
  makeAuthenticatedRequest('/requests/?page=1&page_size=10', token);
  sleep(1);
  
  makeAuthenticatedRequest('/maintenances/scheduled/?page=1&page_size=10', token);
  sleep(1);
}

// Load Test: Simular carga normal
export function loadTest() {
  const token = performLogin();
  
  if (!token) {
    return;
  }
  
  sleep(0.5);
  
  // Simular navegación típica de usuario
  const endpoints = [
    '/machines/?page=1&page_size=10',
    '/requests/?page=1&page_size=10',
    '/maintenances/scheduled/?page=1&page_size=10',
    '/machines/1/', // Detalle de maquinaria
  ];
  
  // Hacer peticiones aleatorias
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  makeAuthenticatedRequest(randomEndpoint, token);
  
  sleep(Math.random() * 2 + 1); // Entre 1 y 3 segundos
}

// Stress Test: Empujar el sistema al límite
export function stressTest() {
  const token = performLogin();
  
  if (!token) {
    return;
  }
  
  // Peticiones más agresivas con menos tiempo de espera
  const endpoints = [
    '/machines/?page=1&page_size=50',
    '/requests/?page=1&page_size=50',
    '/maintenances/scheduled/?page=1&page_size=50',
  ];
  
  endpoints.forEach(endpoint => {
    makeAuthenticatedRequest(endpoint, token);
    sleep(0.1); // Menos tiempo entre peticiones
  });
  
  sleep(0.5);
}

// Función de teardown para mostrar resumen
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    '../results/2025-11-26/k6-results/summary.json': JSON.stringify(data),
  };
}

// Función auxiliar para resumen de texto
function textSummary(data, options) {
  const indent = options?.indent || '';
  const enableColors = options?.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}========================================\n`;
  summary += `${indent}   K6 LOAD TEST SUMMARY - AMMS\n`;
  summary += `${indent}========================================\n\n`;
  
  // Resumen por escenario
  for (const [scenarioName, scenarioData] of Object.entries(data.root_group.groups || {})) {
    summary += `${indent}📊 ${scenarioName.toUpperCase()}:\n`;
    summary += `${indent}   Duración: ${scenarioData.duration || 'N/A'}ms\n`;
    summary += `${indent}   Checks passed: ${scenarioData.checks?.passes || 0}/${scenarioData.checks?.passes + scenarioData.checks?.fails || 0}\n\n`;
  }
  
  // Métricas clave
  const metrics = data.metrics || {};
  
  if (metrics.http_req_duration) {
    summary += `${indent}⚡ HTTP Request Duration:\n`;
    summary += `${indent}   Avg: ${metrics.http_req_duration.values.avg?.toFixed(2)}ms\n`;
    summary += `${indent}   P95: ${metrics.http_req_duration.values['p(95)']?.toFixed(2)}ms\n`;
    summary += `${indent}   P99: ${metrics.http_req_duration.values['p(99)']?.toFixed(2)}ms\n\n`;
  }
  
  if (metrics.login_duration) {
    summary += `${indent}🔐 Login Duration:\n`;
    summary += `${indent}   Avg: ${metrics.login_duration.values.avg?.toFixed(2)}ms\n`;
    summary += `${indent}   P95: ${metrics.login_duration.values['p(95)']?.toFixed(2)}ms\n\n`;
  }
  
  if (metrics.http_req_failed) {
    summary += `${indent}❌ Failed Requests:\n`;
    summary += `${indent}   Rate: ${(metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n\n`;
  }
  
  if (metrics.successful_requests && metrics.failed_requests) {
    const total = metrics.successful_requests.values.count + metrics.failed_requests.values.count;
    summary += `${indent}📈 Total Requests:\n`;
    summary += `${indent}   Successful: ${metrics.successful_requests.values.count}\n`;
    summary += `${indent}   Failed: ${metrics.failed_requests.values.count}\n`;
    summary += `${indent}   Total: ${total}\n\n`;
  }
  
  summary += `${indent}========================================\n`;
  
  return summary;
}
