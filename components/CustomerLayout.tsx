import CustomerSidebar from './CustomerSidebar'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8f5f7] overflow-hidden">
      <CustomerSidebar />
      <main className="flex-1 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
