"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// 1. Criar um novo Projeto (Sessão de Chat)
export async function createProject(name: string, description?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      userId: session.user.id,
      // Cria a mensagem inicial do sistema automaticamente
      messages: {
        create: {
          role: "system",
          content: "Olá! Sou seu **Arquiteto de Software e Agente de IA**. Como posso ajudar a construir seu próximo projeto? \n\n*Dica: Você pode anexar documentações em PDF ou Texto para que eu gere componentes com as APIs mais recentes.*",
        }
      }
    }
  })

  return project
}

// 2. Buscar todos os projetos do usuário (Para a Sidebar)
export async function getUserProjects() {
  const session = await auth()
  
  if (!session?.user?.id) return []

  return prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true }
  })
}

// 3. Buscar o histórico de mensagens de um projeto específico
export async function getProjectMessages(projectId: string) {
  const session = await auth()
  
  if (!session?.user?.id) throw new Error("Não autorizado")

  // Valida se o projeto pertence ao usuário logado
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
  })

  if (!project) throw new Error("Projeto não encontrado ou sem permissão")

  return prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" }, // Ordem cronológica para o chat
  })
}

// 4. Salvar uma nova mensagem (Chamada logo antes de enviar para o n8n e logo após receber a resposta)
export async function saveMessage(projectId: string, role: "user" | "agent" | "system", content: string, attachments?: any) {
  const session = await auth()
  
  if (!session?.user?.id) throw new Error("Não autorizado")

  // Opcional: Atualizar o updatedAt do projeto para que ele suba na lista da sidebar
  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() }
  })

  return prisma.message.create({
    data: {
      projectId,
      role,
      content,
      attachments: attachments || null,
    }
  })
}
