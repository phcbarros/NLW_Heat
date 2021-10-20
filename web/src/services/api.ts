import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:4000',
})

export function addToken(token: string) {
  api.defaults.headers.common.authorization = `Bearer ${token}`
}
