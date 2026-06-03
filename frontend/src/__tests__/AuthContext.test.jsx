import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'

// Composant de test qui expose le contexte
function TestComponent() {
  const { user, token, isAuth, loading } = useAuth()
  return (
    <div>
      <span data-testid="isAuth">{String(isAuth)}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="role">{user?.role || 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
    </div>
  )
}

function TestLogin() {
  const { login, logout, user, isAuth } = useAuth()
  return (
    <div>
      <span data-testid="isAuth">{String(isAuth)}</span>
      <span data-testid="name">{user?.first_name || 'none'}</span>
      <button onClick={() => login('my-token', { id: 1, first_name: 'James', role: 'host' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('démarre non authentifié si localStorage vide', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await act(async () => {})
    expect(screen.getByTestId('isAuth').textContent).toBe('false')
    expect(screen.getByTestId('role').textContent).toBe('none')
  })

  it('restaure la session depuis localStorage', async () => {
    localStorage.setItem('etnair_token', 'saved-token')
    localStorage.setItem('etnair_user', JSON.stringify({ id: 1, first_name: 'Oliver', role: 'guest' }))

    render(<AuthProvider><TestComponent /></AuthProvider>)
    await act(async () => {})

    expect(screen.getByTestId('isAuth').textContent).toBe('true')
    expect(screen.getByTestId('role').textContent).toBe('guest')
    expect(screen.getByTestId('token').textContent).toBe('saved-token')
  })

  it('login met à jour l\'état et localStorage', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider><TestLogin /></AuthProvider>
    )
    await act(async () => {})

    expect(getByTestId('isAuth').textContent).toBe('false')

    await act(async () => { getByText('Login').click() })

    expect(getByTestId('isAuth').textContent).toBe('true')
    expect(getByTestId('name').textContent).toBe('James')
    expect(localStorage.getItem('etnair_token')).toBe('my-token')
  })

  it('logout efface l\'état et localStorage', async () => {
    localStorage.setItem('etnair_token', 'tok')
    localStorage.setItem('etnair_user', JSON.stringify({ id: 1, first_name: 'James', role: 'host' }))

    const { getByText, getByTestId } = render(
      <AuthProvider><TestLogin /></AuthProvider>
    )
    await act(async () => {})

    expect(getByTestId('isAuth').textContent).toBe('true')

    await act(async () => { getByText('Logout').click() })

    expect(getByTestId('isAuth').textContent).toBe('false')
    expect(localStorage.getItem('etnair_token')).toBeNull()
    expect(localStorage.getItem('etnair_user')).toBeNull()
  })
})
