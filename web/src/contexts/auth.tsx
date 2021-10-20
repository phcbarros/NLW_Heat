import {createContext, ReactNode, useEffect, useMemo, useState} from 'react'
import {addToken, api} from '../services/api'

type User = {
  id: string
  name: string
  login: string
  avatar_url: string
}

type AuthResponse = {
  token: string
  user: User
}

type AuthContextData = {
  user: User | null
  signInUrl: string
  signOut: () => void
}

export const AuthContext = createContext({} as AuthContextData)

type AuthProvider = {
  children: ReactNode
}

const LOCALSTORAGE_KEY = '@dowhile:token'
const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
const redirectUri = import.meta.env.VITE_GITHUB_CALLBACK_URL

const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirectUri=${redirectUri}`

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null)

  async function sign(githubCode: string) {
    const response = await api.post<AuthResponse>('authenticate', {
      code: githubCode,
    })

    const {token, user} = response.data

    localStorage.setItem(LOCALSTORAGE_KEY, token)

    addToken(token)

    setUser(user)
  }

  function signOut() {
    setUser(null)
    localStorage.removeItem(LOCALSTORAGE_KEY)
  }

  useEffect(() => {
    const token = localStorage.getItem(LOCALSTORAGE_KEY)

    if (!token) {
      return
    }

    addToken(token)

    async function getUserProfile() {
      const response = await api.get<User>('profile')

      setUser(response.data)
    }

    getUserProfile()
  }, [])

  useEffect(() => {
    const url = window.location.href
    const hasGithubCode = url.includes('?code=')

    if (!hasGithubCode) {
      return
    }

    const [urlWithoutCode, githubCode] = url.split('?code=')
    window.history.pushState({}, '', urlWithoutCode)

    sign(githubCode)
  }, [])

  const context = useMemo(
    () =>
      ({
        signInUrl,
        user,
        signOut,
      } as AuthContextData),
    [user],
  )

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  )
}
