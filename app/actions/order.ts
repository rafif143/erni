'use server'

import { createClient } from '@/lib/supabase/server'

interface CreateOrderInput {
    dress_id: string
    size: string
    quantity: number
    rental_start: string
    rental_end: string
    total_price: number
    payment_proof: string
    current_stock: number
}

export async function createOrderAndDecrementStock(input: CreateOrderInput) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Anda harus login terlebih dahulu' }
    }

    // Cek stok terbaru dari database (bukan dari client yg bisa stale)
    const { data: dress, error: dressError } = await supabase
        .from('dresses')
        .select('stock')
        .eq('id', input.dress_id)
        .single()

    if (dressError || !dress) {
        return { error: 'Kostum tidak ditemukan' }
    }

    if (dress.stock < input.quantity) {
        return { error: `Stok tidak mencukupi. Stok tersedia: ${dress.stock}` }
    }

    // Buat order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            status: 'pending',
            total_price: input.total_price,
            rental_start: input.rental_start,
            rental_end: input.rental_end,
            payment_proof: input.payment_proof,
        })
        .select()
        .single()

    if (orderError) {
        return { error: orderError.message }
    }

    // Buat order item
    const { error: itemError } = await supabase
        .from('order_items')
        .insert({
            order_id: order.id,
            dress_id: input.dress_id,
            quantity: input.quantity,
            price: input.total_price,
            size: input.size,
        })

    if (itemError) {
        return { error: itemError.message }
    }

    // Kurangi stok
    const { error: stockError } = await supabase
        .from('dresses')
        .update({ stock: dress.stock - input.quantity })
        .eq('id', input.dress_id)

    if (stockError) {
        return { error: 'Order berhasil tapi gagal update stok: ' + stockError.message }
    }

    return { success: true, orderId: order.id }
}
