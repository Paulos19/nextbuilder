"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, type MessageRole, type ChatMessageProps } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { v4 as uuidv4 } from "uuid"
import { sendMessageToAgent } from "@/app/actions/chat" // <-- Import da Server Action real

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      id: "init",
      role: "system",
      content: "Olá! Sou seu **Arquiteto de Software e Agente de IA**. Como posso ajudar a construir seu próximo projeto? \n\n*Dica: Você pode anexar documentações em PDF ou Texto para que eu gere componentes com as APIs mais recentes.*",
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  
  // Ref otimizado para rolar sempre para a última mensagem perfeitamente
  const messagesEndRef = useRef<HTMLDivElement>(null) 

  // Auto-scroll fluido sempre que a lista de mensagens for alterada
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
      // 2. Prepara o payload usando FormData para suportar envio binário de arquivos
      const formData = new FormData()
      formData.append("message", content)
      
      files.forEach((file) => {
        formData.append("files", file)
      })

      // 3. Chamada real para o n8n via Server Action
      const response = await sendMessageToAgent(formData)

      // 4. Tratamento da resposta
      if (response?.error) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          role: "agent",
          content: `⚠️ **Erro de Comunicação:** ${response.error}`
        }])
      } else if (response?.reply) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          role: "agent",
          content: response.reply
        }])
      }

    } catch (error) {
      console.error("Erro fatal ao comunicar com o agente:", error)
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: "agent",
        content: "⚠️ *Ocorreu um erro inesperado ao processar sua requisição. Verifique sua conexão e o status do webhook.*"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Área de Mensagens (Histórico) */}
      <ScrollArea className="flex-1">
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
          
          {/* Feedback Visual de Carregamento (Skeleton / Pulse) */}
          {isLoading && (
            <div className="p-6 text-sm text-muted-foreground flex items-center gap-2 max-w-4xl mx-auto w-full">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-75">●</span>
              <span className="animate-pulse delay-150">●</span>
              <span className="ml-2">O agente está processando a arquitetura e gerando o código...</span>
            </div>
          )}
          
          {/* Âncora invisível para o auto-scroll */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input de Comando (Afixado no rodapé) */}
      <div className="w-full max-w-4xl mx-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
