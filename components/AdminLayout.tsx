import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f5f7]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  )
}
