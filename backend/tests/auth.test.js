const request = require('supertest');
const app = require('../src/app');

describe('AUTH — Register & Login', () => {

  // REGISTER
  describe('POST /auth/register', () => {

    it('doit créer un compte avec des données valides', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: `testuser_${Date.now()}@email.com`,
          password: 'TestPassword123!',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.role).toBe('guest');
    });

    it('doit refuser si email déjà utilisé (409)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Oliver',
          last_name: 'Davis',
          email: 'oliver.davis@email.com',
          password: 'MotDePasse123!',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message');
    });

    it('doit refuser si email manquant (400)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          password: 'MotDePasse123!',
        });

      expect(res.statusCode).toBe(400);
    });

    it('doit refuser un mot de passe trop court (400)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'nouveau@email.com',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // LOGIN
  describe('POST /auth/login', () => {

    it('doit retourner un token JWT valide', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'oliver.davis@email.com',
          password: 'password',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('doit refuser avec un mauvais mot de passe (401)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'oliver.davis@email.com',
          password: 'mauvaispassword',
        });

      expect(res.statusCode).toBe(401);
    });

    it('doit refuser avec un email inconnu (401)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'inconnu@email.com',
          password: 'password',
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
