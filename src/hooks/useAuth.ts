const STORAGE_KEY = 'admin_auth'

export function useAuth() {
  const isAuthenticated = (): boolean => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  }

  const login = (_password: string): boolean => {
    localStorage.setItem(STORAGE_KEY, 'true')
    return true
  }

  const logout = (): void => {
    localStorage.removeItem(STORAGE_KEY)
  }

  return { isAuthenticated, login, logout }
}
