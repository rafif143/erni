import CustomerSidebar from './CustomerSidebar'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f5f7]">
      <CustomerSidebar />
      <main className="flex-1 md:ml-0">
        {children}
      </main>
    </div>
  )
}
