import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  return redirect('/auth/login')
}

export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  return redirect('/auth/login')
}
