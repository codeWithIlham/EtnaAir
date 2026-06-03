import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// Mocks
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, isAuth: false }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn(),
  },
  default: {},
}))

import { authAPI } from '../services/api'

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre de connexion', () => {
    renderLogin()
    expect(screen.getByText(/Bon retour/i)).toBeInTheDocument()
  })

  it('affiche les champs email et mot de passe', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/votre@email\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument()
  })

  it('affiche le bouton de connexion', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('affiche les comptes de démonstration', () => {
    renderLogin()
    expect(screen.getByText(/démo/i)).toBeInTheDocument()
    expect(screen.getByText(/Admin/)).toBeInTheDocument()
  })

  it('remplit le formulaire quand on clique sur un compte démo', async () => {
    renderLogin()
    const adminBtn = screen.getByText(/Admin/)
    await userEvent.click(adminBtn)
    const emailInput = screen.getByPlaceholderText(/votre@email\.com/i)
    expect(emailInput.value).toBe('admin@etnair.com')
  })

  it('appelle authAPI.login avec les bonnes données', async () => {
    authAPI.login.mockResolvedValueOnce({
      data: { token: 'fake-token', user: { id: 1, role: 'guest', first_name: 'Test', last_name: 'User', email: 'test@test.com' } }
    })

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/votre@email\.com/i), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'password')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      })
    })
  })

  it('affiche un message d\'erreur en cas d\'échec', async () => {
    authAPI.login.mockRejectedValueOnce({
      response: { data: { message: 'Email ou mot de passe incorrect.' } }
    })

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/votre@email\.com/i), 'bad@email.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument()
    })
  })

  it('redirige après connexion réussie', async () => {
    authAPI.login.mockResolvedValueOnce({
      data: { token: 'jwt-token', user: { id: 1, role: 'guest', first_name: 'Oliver', last_name: 'Davis', email: 'oliver@test.com' } }
    })

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/votre@email\.com/i), 'oliver@test.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'password')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jwt-token', expect.objectContaining({ role: 'guest' }))
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('contient un lien vers la page inscription', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /s'inscrire/i })).toBeInTheDocument()
  })
})
