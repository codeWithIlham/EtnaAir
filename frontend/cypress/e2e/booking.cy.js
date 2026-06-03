
describe('Réservations', () => {

  describe('Créer une réservation', () => {

    beforeEach(() => {
      cy.loginAsGuest()
    })

    it('crée une réservation depuis la page détail', () => {
      cy.visit('/annonces/2')
      // Vérifier que le formulaire de réservation est visible
      cy.contains(/réserver maintenant/i, { timeout: 8000 }).should('be.visible')

      // Sélectionner des dates futures
      const today = new Date()
      const start = new Date(today); start.setDate(today.getDate() + 30)
      const end = new Date(today);   end.setDate(today.getDate() + 33)
      const fmt = d => d.toISOString().split('T')[0]

      const dateInputs = cy.get('input[type="date"]')
      dateInputs.first().clear().type(fmt(start))
      dateInputs.last().clear().type(fmt(end))

      cy.contains(/réserver maintenant/i).click()
      // Confirmation
      cy.contains(/réservation confirmée|🎉/i, { timeout: 10000 }).should('be.visible')
    })

    it('affiche le récapitulatif du prix avant réservation', () => {
      cy.visit('/annonces/1')
      cy.get('input[type="date"]').should('have.length', 2)
      // Le total devrait être visible
      cy.contains(/total/i).should('be.visible')
    })
  })

  describe('Mes réservations', () => {

    beforeEach(() => {
      cy.loginAsGuest()
    })

    it('accède à la page Mes réservations', () => {
      cy.visit('/bookings')
      cy.contains(/mes réservations/i, { timeout: 8000 }).should('be.visible')
    })

    it('affiche les réservations de l\'utilisateur connecté', () => {
      cy.visit('/bookings')
      // Soit des réservations, soit le message "aucune réservation"
      cy.get('body', { timeout: 10000 }).then($body => {
        const hasBookings = $body.text().includes('Logement #') || $body.text().includes('nuit')
        const hasEmpty    = $body.text().includes('Aucune réservation')
        expect(hasBookings || hasEmpty).to.be.true
      })
    })

    it('redirige vers /login si non authentifié', () => {
      cy.clearLocalStorage()
      cy.visit('/bookings')
      cy.url({ timeout: 5000 }).should('include', '/login')
    })
  })
})
