import type { AvatarProps } from '@nuxt/ui'
import { includes } from 'zod'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface Customer {
  id: number
  name: string
  phone: string
  email: string
  messenger: string
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  category: Category
}

export interface Part {
  id: number
  name: string
  price: number
  value: number
  total?: number
}

export interface PartData extends Part {
  price: string
  total? : number
}

export interface Lead {
  id: number | string
  code: string
  description: string
  status: string
  address: string
  customer: Customer
  author: User
  product: Product
  parts: Part[]
}

export interface UpdateLeadForm {
    id: number | string
    status: string
    author_id: number
    customer_id: number
    product_id: number
    code: string
    description: string
    address: string
    parts: number[]
}