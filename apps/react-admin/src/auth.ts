const AUTH_STORAGE_KEY = 'cq-admin-authenticated'

export function isAuthenticated() {
  return (
    localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ||
    sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  )
}

export function signIn(remember: boolean) {
  signOut()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(AUTH_STORAGE_KEY, 'true')
}

export function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
