
// Commande : connexion via API (plus rapide que via UI)
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password })
    .then(({ body }) => {
      localStorage.setItem('etnair_token', body.token)
      localStorage.setItem('etnair_user', JSON.stringify(body.user))
    })
})

// Commande : connexion admin rapide
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
})

// Commande : connexion hôte rapide
Cypress.Commands.add('loginAsHost', () => {
  cy.login(Cypress.env('hostEmail'), Cypress.env('hostPassword'))
})

// Commande : connexion guest rapide
Cypress.Commands.add('loginAsGuest', () => {
  cy.login(Cypress.env('guestEmail'), Cypress.env('guestPassword'))
})
