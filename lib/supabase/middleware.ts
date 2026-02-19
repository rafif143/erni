import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Jika belum login dan bukan di halaman auth, redirect ke login
  if (!user && !pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Jika sudah login
  if (user) {
    // Ambil role dari database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role || 'customer'

    // Redirect admin ke /admin jika akses /customer
    if (userRole === 'admin' && pathname.startsWith('/customer')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Redirect customer ke /customer jika akses /admin
    if (userRole === 'customer' && pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/customer'
      return NextResponse.redirect(url)
    }

    // Redirect dari auth ke dashboard sesuai role
    if (pathname.startsWith('/auth') && pathname !== '/auth/logout') {
      const url = request.nextUrl.clone()
      url.pathname = userRole === 'admin' ? '/admin' : '/customer'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
