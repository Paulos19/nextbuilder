import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login") // Proteção básica na raiz do grupo
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Aqui entrará a Sidebar com o histórico de chats no futuro */}
      <aside className="w-64 border-r bg-muted/20 hidden md:block">
        <div className="p-4 font-semibold">Workspace</div>
      </aside>
      
      <main className="flex-1 flex flex-col relative">
        {/* Navbar de topo */}
        <header className="h-14 border-b flex items-center px-4 justify-between">
          <span className="font-medium">Projeto Atual</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{session.user?.email}</span>
          </div>
        </header>
        
        {/* Área útil onde o Chat do Agente renderizará a UI */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
