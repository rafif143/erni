import { redirect } from 'next/navigation'

// Redirect to login page
export default async function Home() {
  redirect('/auth/login')
}
