import { env } from './config'

const noticeKey = `${env.sessionStorageKey}:notice`

export function readStoredToken() {
  return sessionStorage.getItem(env.sessionStorageKey)
}

export function writeStoredToken(token: string) {
  sessionStorage.setItem(env.sessionStorageKey, token)
}

export function clearStoredToken() {
  sessionStorage.removeItem(env.sessionStorageKey)
}

export function writeAuthNotice(message: string) {
  sessionStorage.setItem(noticeKey, message)
}

export function readAuthNotice() {
  return sessionStorage.getItem(noticeKey)
}

export function clearAuthNotice() {
  sessionStorage.removeItem(noticeKey)
}
