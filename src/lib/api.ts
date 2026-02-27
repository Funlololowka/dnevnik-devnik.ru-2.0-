import axios from 'axios'
import type { DnevnikUser, Lesson, Grade, Homework, Period } from '@/types'

const BASE_URL = 'https://dnevnik.ru/api'

export function createApiClient(accessToken: string) {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: `DnevnikAuth_a=${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  return {
    async getMe(): Promise<DnevnikUser> {
      const { data } = await client.get('/users/me')
      return data
    },
    async getSchedule(personId: number | string, groupId: number | string, startDate: string, endDate: string): Promise<Lesson[]> {
      const { data } = await client.get(`/persons/${personId}/groups/${groupId}/schedules`, { params: { startDate, endDate } })
      return data
    },
    async getGrades(personId: number | string, groupId: number | string, startDate: string, endDate: string): Promise<Grade[]> {
      const { data } = await client.get(`/persons/${personId}/groups/${groupId}/recentmarks`, { params: { startDate, endDate, limit: 200 } })
      return data
    },
    async getHomework(personId: number | string, groupId: number | string, startDate: string, endDate: string): Promise<Homework[]> {
      const { data } = await client.get(`/persons/${personId}/groups/${groupId}/homeworks`, { params: { startDate, endDate } })
      return data
    },
    async markHomeworkDone(homeworkId: number): Promise<void> {
      await client.post(`/homeworks/${homeworkId}/done`)
    },
    async getPeriods(groupId: number | string): Promise<Period[]> {
      const { data } = await client.get(`/groups/${groupId}/periods`)
      return data
    },
    async getUserGroups(personId: number | string) {
      const { data } = await client.get(`/persons/${personId}/groups`)
      return data
    },
  }
}
