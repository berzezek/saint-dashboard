import { defineStore } from 'pinia'
import type { Part } from '../types'

const initialParts: Part[] = [
  { id: 101, name: 'Диагностика', price: 50, value: 2 },
  { id: 102, name: 'Установка ПО', price: 120, value: 2 },
  { id: 103, name: 'Настройка сети', price: 90, value: 2 },
  { id: 104, name: 'Замена модуля', price: 200, value: 2 },
  { id: 105, name: 'Тестирование', price: 80, value: 2 },
]

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    parts: initialParts as Part[],
    isFetching: false as boolean
  }),

  getters: {
    /** Получить часть по ID */
    byId: (state) => (id: number | string) =>
      state.parts.find(p => p.id === Number(id)),

    /** Фильтрация по имени (частичное совпадение) */
    filterByName: (state) => (query: string) =>
      state.parts.filter(p =>
        p.name.toLowerCase().includes(query.trim().toLowerCase())
      ),

    /** Последний ID для генерации нового */
    lastId: (state) =>
      state.parts.reduce((max, p) => Math.max(max, p.id), 0)
  },

  actions: {
    /** Загрузить с сервера */
    async fetchAll(fetcher?: () => Promise<Part[]>) {
      try {
        this.isFetching = true
        const result = fetcher ? await fetcher() : []
        if (result.length) this.parts = result
      } finally {
        this.isFetching = false
      }
    },

    /** Добавить новую задачу */
    add(part: Omit<Part, 'id'>) {
      const newId = this.lastId + 1
      const newPart: Part = { ...part, id: newId }
      this.parts.push(newPart)
      return newId
    },

    /** Обновить существующую задачу */
    update(id: number, patch: Partial<Part>) {
      const index = this.parts.findIndex(p => p.id === id)
      if (index === -1) return false
      this.parts[index] = { ...this.parts[index], ...patch }
      return true
    },

    /** Удалить задачу */
    remove(id: number) {
      const index = this.parts.findIndex(p => p.id === id)
      if (index === -1) return false
      this.parts.splice(index, 1)
      return true
    }
  }
})