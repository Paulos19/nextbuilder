"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, type MessageRole, type ChatMessageProps } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { v4 as uuidv4 } from "uuid"

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      id: "init",
      role: "system",
      content: "Olá! Sou seu **Arquiteto de Software e Agente de IA**. Como posso ajudar a construir seu próximo projeto? \n\n*Dica: Você pode anexar documentações em PDF ou Texto para que eu gere componentes com as APIs mais recentes.*",
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (content: string, files: File[]) => {
    // 1. Adiciona a mensagem do usuário na UI imediatamente (Optimistic UI)
    const userMsgId = uuidv4()
    const userMessage: ChatMessageProps = {
      id: userMsgId,
      role: "user",
      content,
      attachments: files.map(f => ({ name: f.name, type: f.type }))
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 🚧 AQUI ENTRARÁ A INTEGRAÇÃO COM O n8n VIA SERVER ACTION 🚧
      // Simulando tempo de resposta do agente (CLI / Planejamento)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const agentResponse: ChatMessageProps = {
        id: uuidv4(),
        role: "agent",
        content: "Entendido. Vamos iniciar a configuração do projeto **Next.js 15 + Prisma + shadcn/ui**.\n\n### 1. Inicialização\nExecute o seguinte comando no seu terminal:\n\n```bash\nnpx create-next-app@latest my-app --typescript --tailwind --eslint\n```\n\nAnalisei a documentação anexada. O fluxo de autenticação está correto. Posso prosseguir com a geração da estrutura de pastas `app/(auth)`?",
      }

      setMessages(prev => [...prev, agentResponse])
    } catch (error) {
      console.error("Erro ao comunicar com o agente:", error)
      // Tratamento de erro na UI
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: "agent",
        content: "⚠️ *Ocorreu um erro ao processar sua requisição. Por favor, tente novamente.*"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Área de Mensagens (Histórico) */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col pb-4 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              role={msg.role}
              content={msg.content}
              attachments={msg.attachments}
            />
          ))}
          
          {isLoading && (
            <div className="p-6 text-sm text-muted-foreground flex items-center gap-2 max-w-4xl mx-auto w-full">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-75">●</span>
              <span className="animate-pulse delay-150">●</span>
              <span className="ml-2">O agente está pensando e estruturando a arquitetura...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input de Comando (Afixado no rodapé) */}
      <div className="w-full max-w-4xl mx-auto">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
