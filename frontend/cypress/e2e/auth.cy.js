
describe('Authentification', () => {

  beforeEach(() => {
    cy.visit('/')
  })

  // Page connexion
  describe('Page de connexion', () => {

    it('affiche le formulaire de connexion', () => {
      cy.visit('/login')
      cy.contains('Bon retour').should('be.visible')
      cy.get('input[type="email"]').should('exist')
      cy.get('input[type="password"]').should('exist')
      cy.get('button[type="submit"]').should('contain', 'connecter')
    })

    it('affiche une erreur avec des identifiants incorrects', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('inconnu@email.com')
      cy.get('input[type="password"]').type('mauvaismdp')
      cy.get('button[type="submit"]').click()
      cy.contains(/incorrect|introuvable|not found/i, { timeout: 5000 }).should('be.visible')
    })

    it('connecte un utilisateur avec les bons identifiants', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type(Cypress.env('guestEmail'))
      cy.get('input[type="password"]').type(Cypress.env('guestPassword'))
      cy.get('button[type="submit"]').click()
      // Redirigé vers l'accueil
      cy.url({ timeout: 8000 }).should('eq', `${Cypress.config('baseUrl')}/`)
      // Navbar montre le nom de l'utilisateur
      cy.contains('Oliver').should('be.visible')
    })

    it('remplit le formulaire via un compte démo', () => {
      cy.visit('/login')
      cy.contains('Admin').first().click()
      cy.get('input[type="email"]').should('have.value', 'admin@etnair.com')
    })

    it('redirige vers l\'inscription depuis la page login', () => {
      cy.visit('/login')
      cy.contains(/s'inscrire/i).click()
      cy.url().should('include', '/register')
    })
  })

  // Page inscription
  describe('Page d\'inscription', () => {

    it('affiche le formulaire d\'inscription', () => {
      cy.visit('/register')
      cy.contains('Créer un compte').should('be.visible')
      cy.get('input[placeholder="Jean"]').should('exist')
      cy.get('input[placeholder="Dupont"]').should('exist')
    })

    it('refuse si les mots de passe ne correspondent pas', () => {
      cy.visit('/register')
      cy.get('input[placeholder="Jean"]').type('Test')
      cy.get('input[placeholder="Dupont"]').type('User')
      cy.get('input[type="email"]').type('newuser@test.com')
      cy.get('input[placeholder="Min. 6 caractères"]').type('password123')
      cy.get('input[placeholder="••••••••"]').type('different456')
      cy.get('button[type="submit"]').click()
      cy.contains(/correspondent pas/i).should('be.visible')
    })
  })

  // Déconnexion
  describe('Déconnexion', () => {

    it('déconnecte l\'utilisateur et redirige vers l\'accueil', () => {
      cy.loginAsGuest()
      cy.visit('/')
      cy.contains('Oliver').click()
      cy.contains('Déconnexion').click()
      cy.contains('Oliver').should('not.exist')
      cy.contains(/connexion/i).should('be.visible')
    })
  })

  // Route protégée
  describe('Routes protégées', () => {

    it('redirige vers /login si non connecté et accès /bookings', () => {
      cy.visit('/bookings')
      cy.url({ timeout: 5000 }).should('include', '/login')
    })

    it('redirige vers / si non-admin accède à /admin', () => {
      cy.loginAsGuest()
      cy.visit('/admin')
      cy.url({ timeout: 5000 }).should('eq', `${Cypress.config('baseUrl')}/`)
    })

    it('permet l\'accès à /admin pour un admin', () => {
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.contains('Dashboard', { timeout: 8000 }).should('be.visible')
    })
  })
})
