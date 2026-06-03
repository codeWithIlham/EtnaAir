const request = require('supertest');
const app = require('../src/app');

describe('AVIS — Reviews', () => {

  let guestToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'oliver.davis@email.com', password: 'password' });
    guestToken = res.body.token;
  });

  // GET by property
  describe('GET /reviews/property/:id', () => {

    it('doit retourner les avis de la villa Lyon (id=3)', async () => {
      const res = await request(app).get('/reviews/property/3');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const review = res.body.find(r => r.rating === 5);
      expect(review).toBeDefined();
      expect(review.comment).toContain('stunning');
    });

    it('doit retourner les avis du Studio Montmartre (id=1)', async () => {
      const res = await request(app).get('/reviews/property/1');

      expect(res.statusCode).toBe(200);
      expect(res.body[0].rating).toBe(5);
    });

    it('doit retourner les avis du Loft Bordeaux (id=5, rating=3)', async () => {
      const res = await request(app).get('/reviews/property/5');

      expect(res.statusCode).toBe(200);
      expect(res.body[0].rating).toBe(3);
    });

    it('property inexistante → 404', async () => {
      const res = await request(app).get('/reviews/property/9999');
      expect(res.statusCode).toBe(404);
    });
  });

  // POST
  describe('POST /reviews', () => {

    it('doit poster un avis pour une réservation complétée', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 6,
          booking_id: 6,
          rating: 5,
          comment: 'Test avis depuis Jest — super séjour !',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.rating).toBe(5);
    });

    it('rating hors limites (6/5) → 400', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 1,
          booking_id: 1,
          rating: 6,
          comment: 'Rating trop élevé',
        });

      expect(res.statusCode).toBe(400);
    });

    it('rating en dessous du minimum (0/5) → 400', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 1,
          booking_id: 1,
          rating: 0,
          comment: 'Rating trop bas',
        });

      expect(res.statusCode).toBe(400);
    });

    it('sans token → 401', async () => {
      const res = await request(app)
        .post('/reviews')
        .send({ property_id: 1, booking_id: 1, rating: 4 });

      expect(res.statusCode).toBe(401);
    });

    it('booking_id manquant → 400', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ property_id: 1, rating: 4 });

      expect(res.statusCode).toBe(400);
    });
  });
});
