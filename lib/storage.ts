import { createClient } from '@/lib/supabase/client'

export const BUCKET_NAME = 'dress-images'
export const PAYMENT_BUCKET_NAME = 'payment-proofs'

export async function uploadDressImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()
  
  // Validasi file
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { url: null, error: 'Ukuran file maksimal 5MB' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Format file harus JPG, PNG, WEBP, atau GIF' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    return { url: null, error: error.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}

export async function uploadPaymentProof(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()
  
  // Validasi file
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { url: null, error: 'Ukuran file maksimal 5MB' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Format file harus JPG, PNG, WEBP, atau GIF' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(PAYMENT_BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    return { url: null, error: error.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(PAYMENT_BUCKET_NAME)
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}

export async function deleteDressImage(imageUrl: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  // Extract filename from URL
  const urlParts = imageUrl.split('/')
  const fileName = urlParts[urlParts.length - 1]

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([fileName])

  if (error) {
    console.error('Delete error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export function getImageUrl(fileName: string): string {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)
  
  return publicUrl
}
