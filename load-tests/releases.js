import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 150 },
        { duration: '30s', target: 200 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Under 5% error rate
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1000ms
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:3000/graphql';

export default function () {
  const query = `
    query {
      releases {
        id
        name
        version
        description
        notes
        status
        targetDate
        totalSteps
        completedSteps
        progressPercentage
        project {
          id
          name
          key
          nature
        }
        steps {
          id
          title
          status
          isRequired
        }
      }
    }
  `;

  const response = http.post(API_URL, JSON.stringify({ query }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'graphql request succeeded': (r) => {
      try {
        const body = r.json();
        return !body.errors && Array.isArray(body.data?.releases);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}
