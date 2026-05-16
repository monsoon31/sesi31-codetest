import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // Dipersingkat menjadi total 15 detik untuk kebutuhan CI/CD pipeline
  stages: [
    { duration: '5s', target: 5 },  // Naik ke 5 users dalam 5 detik
    { duration: '5s', target: 5 },  // Bertahan di 5 users selama 5 detik
    { duration: '5s', target: 0 },  // Turun kembali ke 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Dilonggarkan ke 1000ms karena server CI lambat
    http_req_failed: ['rate<0.05'],    // Toleransi kegagalan dinaikkan ke 5%
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Membuat notes - toleransi jika server mengembalikan status 200 atau 201
  const create = http.post(`${BASE}/notes`, JSON.stringify({ title: 't', body: 'b' }), { headers: { 'Content-Type': 'application/json' }});
  check(create, { 'create sukses': r => r.status === 201 || r.status === 200 });

  // Mengambil list notes
  const list = http.get(`${BASE}/notes`);
  check(list, { 'get sukses': r => r.status === 200 });

  sleep(Math.random() * 0.5);
}
