const request = require('supertest');
const app = require('../src/app');

describe('RESERVATIONS — Bookings', () => {

  let guestToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'oliver.davis@email.com', password: 'password' });
    guestToken = res.body.token;
  });

  // GET ALL
  describe('GET /bookings', () => {

    it('doit retourner mes réservations', async () => {
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('sans token → 401', async () => {
      const res = await request(app).get('/bookings');
      expect(res.statusCode).toBe(401);
    });
  });

  // POST
  describe('POST /bookings', () => {

    it('doit créer une réservation valide', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 2,
          start_date: '2025-08-01',
          end_date: '2025-08-05',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.booking_status).toBe('pending');
      expect(parseFloat(res.body.total_price)).toBeGreaterThan(0);
    });

    it('dates invalides (end avant start) → 400', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 1,
          start_date: '2025-08-10',
          end_date: '2025-08-05',
        });

      expect(res.statusCode).toBe(400);
    });

    it('property_id inexistant → 404', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 9999,
          start_date: '2025-09-01',
          end_date: '2025-09-05',
        });

      expect(res.statusCode).toBe(404);
    });

    it('sans token → 401', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({
          property_id: 1,
          start_date: '2025-09-01',
          end_date: '2025-09-05',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // DELETE
  describe('DELETE /bookings/:id', () => {

    it('doit annuler une réservation', async () => {
      const create = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ property_id: 4, start_date: '2025-10-01', end_date: '2025-10-03' });

      const bookingId = create.body.id;

      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('sans token → 401', async () => {
      const res = await request(app).delete('/bookings/1');
      expect(res.statusCode).toBe(401);
    });
  });
});
