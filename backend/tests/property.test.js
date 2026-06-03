const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('ANNONCES — CRUD Properties', () => {

  let guestToken;
  let hostToken;

  beforeAll(async () => {
    // Réinitialiser les prix des propriétés testées
    await prisma.property.update({ where: { id: 1 }, data: { price_per_night: 85.00 } });
    await prisma.property.update({ where: { id: 3 }, data: { price_per_night: 320.00 } });

    const guestLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'oliver.davis@email.com', password: 'password' });
    guestToken = guestLogin.body.token;

    const hostLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'james.carter@email.com', password: 'password' });
    hostToken = hostLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // GET ALL
  describe('GET /annonces', () => {

    it('doit retourner la liste des annonces (sans auth)', async () => {
      const res = await request(app).get('/annonces');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('doit filtrer par ville (Paris)', async () => {
      const res = await request(app).get('/annonces?city=Paris');

      expect(res.statusCode).toBe(200);
      res.body.forEach(p => expect(p.city).toBe('Paris'));
    });

    it('doit filtrer par prix max (100€)', async () => {
      const res = await request(app).get('/annonces?max_price=100');

      expect(res.statusCode).toBe(200);
      res.body.forEach(p => expect(parseFloat(p.price_per_night)).toBeLessThanOrEqual(100));
    });
  });

  // GET BY ID
  describe('GET /annonces/:id', () => {

    it('doit retourner le Charming Studio Montmartre (id=1)', async () => {
      const res = await request(app).get('/annonces/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBe('Charming Studio in Montmartre');
      expect(res.body.city).toBe('Paris');
      expect(parseFloat(res.body.price_per_night)).toBe(85.00);
    });

    it('doit retourner la Luxury Villa Lyon (id=3)', async () => {
      const res = await request(app).get('/annonces/3');

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Luxury Villa with Pool in Lyon');
      expect(parseFloat(res.body.price_per_night)).toBe(320.00);
      expect(res.body.max_guests).toBe(8);
    });

    it('doit retourner 404 pour un id inexistant', async () => {
      const res = await request(app).get('/annonces/9999');
      expect(res.statusCode).toBe(404);
    });
  });

  // POST
  describe('POST /annonces', () => {

    it('un host peut créer une annonce', async () => {
      const res = await request(app)
        .post('/annonces')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'Test Apartment Jest',
          description: 'Appartement de test créé par Jest.',
          price_per_night: 99.99,
          max_guests: 3,
          city: 'Marseille',
          country: 'France',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Apartment Jest');
    });

    it('un guest ne peut PAS créer une annonce (403)', async () => {
      const res = await request(app)
        .post('/annonces')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          title: 'Tentative guest',
          description: 'Pas autorisé.',
          price_per_night: 50,
          max_guests: 2,
        });

      expect(res.statusCode).toBe(403);
    });

    it('sans token → 401', async () => {
      const res = await request(app)
        .post('/annonces')
        .send({
          title: 'Sans token',
          description: 'Non autorisé.',
          price_per_night: 50,
          max_guests: 2,
        });

      expect(res.statusCode).toBe(401);
    });

    it('données manquantes → 400', async () => {
      const res = await request(app)
        .post('/annonces')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ title: 'Incomplet' });

      expect(res.statusCode).toBe(400);
    });
  });

  // PUT
  describe('PUT /annonces/:id', () => {

    it('un host peut modifier une annonce', async () => {
      const res = await request(app)
        .put('/annonces/2')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ price_per_night: 155.00 });

      expect(res.statusCode).toBe(200);
    });

    it('modifier une annonce inexistante → 404', async () => {
      const res = await request(app)
        .put('/annonces/9999')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ price_per_night: 90.00 });

      expect(res.statusCode).toBe(404);
    });
  });

  // DELETE
  describe('DELETE /annonces/:id', () => {

    it('sans token → 401', async () => {
      const res = await request(app).delete('/annonces/8');
      expect(res.statusCode).toBe(401);
    });

    it('annonce inexistante → 404', async () => {
      const res = await request(app)
        .delete('/annonces/9999')
        .set('Authorization', `Bearer ${hostToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
