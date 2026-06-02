/**
 * k6 Load Test for Impjieg Job Board
 *
 * Simulates realistic user traffic patterns:
 * - Homepage browsing
 * - Job listing navigation
 * - Company page visits
 * - Salary calculator usage
 *
 * Docs: https://k6.io/docs/
 *
 * Run: k6 run k6/load-test.js
 * Run with 100 VUs: k6 run --vus 100 --duration 30s k6/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '10s', target: 20 },   // Ramp up to 20 users
    { duration: '30s', target: 50 },   // Stay at 50 users
    { duration: '10s', target: 100 },  // Spike to 100 users
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
    errors: ['rate<0.1'],              // Custom error rate less than 10%
  },
};

const BASE_URL = __ENV.TEST_URL || 'https://impjieg.vercel.app';

const JOB_SLUGS = [
  'software-engineer',
  'frontend-developer',
  'data-analyst',
  'product-manager',
  'devops-engineer',
];

const COMPANY_SLUGS = [
  'techcorp',
  'igaming-co',
  'finance-hub',
  'startup-malta',
];

export default function () {
  const headers = {
    'User-Agent': 'k6-load-test/1.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  group('Homepage', function () {
    const res = http.get(`${BASE_URL}/`, { headers });
    check(res, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage loads under 500ms': (r) => r.timings.duration < 500,
      'homepage contains Impjieg': (r) => r.body.includes('Impjieg'),
    }) || errorRate.add(1);
    sleep(Math.random() * 2 + 1);
  });

  group('Browse Jobs', function () {
    const res = http.get(`${BASE_URL}/jobs`, { headers });
    check(res, {
      'jobs page status is 200': (r) => r.status === 200,
      'jobs page loads under 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
    sleep(Math.random() * 2 + 1);
  });

  group('Job Detail', function () {
    const randomJob = JOB_SLUGS[Math.floor(Math.random() * JOB_SLUGS.length)];
    const res = http.get(
      `${BASE_URL}/jobs/${randomJob}/${randomJob}`,
      { headers }
    );
    check(res, {
      'job detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
    sleep(Math.random() * 2 + 1);
  });

  group('Companies', function () {
    const res = http.get(`${BASE_URL}/companies`, { headers });
    check(res, {
      'companies page status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    sleep(Math.random() * 1 + 0.5);
  });

  group('Pricing', function () {
    const res = http.get(`${BASE_URL}/pricing`, { headers });
    check(res, {
      'pricing page status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    sleep(Math.random() * 1 + 0.5);
  });

  group('Salary Calculator', function () {
    const res = http.get(`${BASE_URL}/salary-calculator`, { headers });
    check(res, {
      'calculator page status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    sleep(Math.random() * 1 + 0.5);
  });

  group('About Page', function () {
    const res = http.get(`${BASE_URL}/about`, { headers });
    check(res, {
      'about page status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    sleep(Math.random() * 1 + 0.5);
  });

  group('Company Page', function () {
    const randomCompany = COMPANY_SLUGS[Math.floor(Math.random() * COMPANY_SLUGS.length)];
    const res = http.get(`${BASE_URL}/companies/${randomCompany}`, { headers });
    check(res, {
      'company page status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
    sleep(Math.random() * 1 + 0.5);
  });
}
