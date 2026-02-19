export interface User {
  id: string
  email: string
  role: 'admin' | 'customer'
  full_name?: string
  phone?: string
  address?: string
  created_at: string
}

export interface Dress {
  id: string
  name: string
  description: string
  price: number // Harga dalam Rupiah (integer, tanpa desimal)
  size: string[]
  category: string
  image_url: string
  stock: number
  available: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  total_price: number // Total harga dalam Rupiah (integer)
  rental_start: string
  rental_end: string
  payment_proof?: string // URL bukti transfer
  created_at: string
  user?: User
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  dress_id: string
  quantity: number
  price: number // Harga dalam Rupiah (integer)
  size: string
  dress?: Dress
}
