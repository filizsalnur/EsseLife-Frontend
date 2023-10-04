import type { categories } from '@/constants/config'

export type DateTime = {
    justDate: Date | null
    dateTime: Date | null
}

export type Categories = typeof categories[number]