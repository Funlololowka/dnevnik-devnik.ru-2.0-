export interface DnevnikUser {
  id: number
  firstName: string
  lastName: string
  middleName?: string
  sex: 'Male' | 'Female'
  birthday?: string
  avatarUrl?: string
  roles: string[]
}

export interface Lesson {
  id: number
  date: string
  startTime: string
  endTime: string
  number: number
  subject: { id: number; name: string }
  teacher?: { id: number; firstName: string; lastName: string; middleName?: string }
  room?: string
  homework?: string
}

export interface Grade {
  id: number
  date: string
  subject: { id: number; name: string }
  value: string
  gradeType: 'Five' | 'Hundred' | 'Custom'
  comment?: string
  lesson?: { id: number; topic?: string }
}

export interface Homework {
  id: number
  lesson: { id: number; date: string; subject: { id: number; name: string } }
  text: string
  attachments?: { id: number; name: string; url: string }[]
  dueDate: string
  isDone?: boolean
}

export interface Period {
  id: number
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: { id: string; name: string; email?: string; image?: string }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    userId: string
  }
}
