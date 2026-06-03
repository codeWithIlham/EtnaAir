
describe('Recherche d\'annonces', () => {

  it('affiche des logements sur la page d\'accueil', () => {
    cy.visit('/')
    // Section "à la une" avec des cartes
    cy.contains(/à la une/i, { timeout: 10000 }).should('be.visible')
    // Au moins une property card doit être présente
    cy.get('a[href*="/annonces/"]', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  it('navigue vers la recherche depuis l\'accueil', () => {
    cy.visit('/')
    cy.get('form').find('button[type="submit"]').first().click()
    cy.url({ timeout: 5000 }).should('include', '/search')
  })

  it('affiche les logements sur la page recherche', () => {
    cy.visit('/search')
    cy.get('a[href*="/annonces/"]', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  it('filtre les annonces par ville', () => {
    cy.visit('/search')
    // Cliquer sur le filtre Paris
    cy.contains('Paris').first().click()
    cy.get('a[href*="/annonces/"]', { timeout: 8000 }).should('have.length.at.least', 1)
    // Tous les résultats devraient mentionner Paris
    cy.get('a[href*="/annonces/"]').first().within(() => {
      cy.contains('Paris').should('exist')
    })
  })

  it('affiche un message quand aucun résultat', () => {
    cy.visit('/search')
    cy.get('input[placeholder*="Ville"]').type('VilleQuiNExistePas123')
    cy.get('button[type="submit"]').click()
    cy.contains(/aucun logement/i, { timeout: 8000 }).should('be.visible')
  })

  it('accède à la page détail d\'un logement', () => {
    cy.visit('/search')
    cy.get('a[href*="/annonces/"]', { timeout: 10000 }).first().click()
    cy.url().should('include', '/annonces/')
    // La page détail affiche le bouton réserver
    cy.contains(/réserver/i, { timeout: 5000 }).should('be.visible')
  })

  it('affiche le bouton "Se connecter pour réserver" si non authentifié', () => {
    cy.visit('/annonces/1')
    cy.contains(/se connecter pour réserver/i, { timeout: 5000 }).should('be.visible')
  })

  it('affiche le formulaire de réservation si connecté', () => {
    cy.loginAsGuest()
    cy.visit('/annonces/1')
    cy.contains(/réserver maintenant/i, { timeout: 8000 }).should('be.visible')
    cy.get('input[type="date"]').should('have.length', 2)
  })

  it('affiche les villes rapides sur l\'accueil', () => {
    cy.visit('/')
    const cities = ['Paris', 'Lyon', 'Bordeaux', 'Nice']
    cities.forEach(city => {
      cy.contains(city).should('be.visible')
    })
  })
})
