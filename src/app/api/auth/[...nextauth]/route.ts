import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'dnevnik-token',
      name: 'Токен Дневника.ру',
      credentials: {
        token: { label: 'Access Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        try {
          const { data } = await axios.get('https://api.dnevnik.ru/v2/users/me', {
            headers: { Cookie: `DnevnikAuth_a=${credentials.token}` },
          })

          return {
            id: String(data.id),
            name: `${data.lastName} ${data.firstName}${data.middleName ? ' ' + data.middleName : ''}`,
            email: data.email ?? null,
            image: data.avatarUrl ?? null,
            accessToken: credentials.token,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.accessToken = user.accessToken
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.id = token.userId as string
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
