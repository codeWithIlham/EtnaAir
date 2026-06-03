const request = require('supertest');
const app = require('../src/app');

// Token admin pour les routes protégées
let adminToken = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@etnair.com', password: 'password' });
  adminToken = res.body.token || '';
});

describe('USERS — Gestion des utilisateurs', () => {

  describe('GET /users', () => {
    it('doit retourner la liste des utilisateurs (admin)', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('doit refuser sans token (401)', async () => {
      const res = await request(app).get('/users');
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe('GET /users/me', () => {
    it('doit retourner le profil de l\'utilisateur connecté', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('role');
    });

    it('doit refuser sans token (401)', async () => {
      const res = await request(app).get('/users/me');
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe('GET /users/:id', () => {
    it('doit retourner un utilisateur par son ID', async () => {
      // Récupère la liste puis cherche un ID valide
      const listRes = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const firstUser = listRes.body[0];
      if (!firstUser) return;

      const res = await request(app)
        .get(`/users/${firstUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', firstUser.id);
    });

    it('doit retourner 404 pour un ID inexistant', async () => {
      const res = await request(app)
        .get('/users/99999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('doit modifier le profil d\'un utilisateur', async () => {
      const listRes = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const firstUser = listRes.body[0];
      if (!firstUser) return;

      const res = await request(app)
        .put(`/users/${firstUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ first_name: 'UpdatedName' });
      expect([200, 204]).toContain(res.statusCode);
    });
  });

});
