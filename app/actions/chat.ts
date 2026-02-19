"use server"

import { auth } from "@/auth"

export async function sendMessageToAgent(formData: FormData) {
  // 1. Validação de Segurança: Apenas usuários logados podem acionar o agente
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Não autorizado. Sessão expirada ou inválida." }
  }

  const message = formData.get("message") as string
  const files = formData.getAll("files") as File[]

  if (!message && files.length === 0) {
    return { error: "Mensagem ou arquivo vazio." }
  }

  // 2. Construção do Payload para o n8n
  // Usamos um novo FormData para enviar via multipart/form-data, permitindo upload binário limpo
  const n8nPayload = new FormData()
  n8nPayload.append("userId", session.user.id)
  n8nPayload.append("userEmail", session.user.email || "")
  n8nPayload.append("message", message)
  
  // Anexando os arquivos com seus nomes originais
  files.forEach((file) => {
    n8nPayload.append("files", file, file.name)
  })

  // 3. Chamada HTTP ao n8n com Retry Policy Básica
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL não está configurada.")
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: n8nPayload,
      headers: {
        // Autenticação Header para garantir que ninguém chame seu webhook do n8n diretamente
        "x-n8n-api-secret": process.env.N8N_API_SECRET || "",
      },
      // Cache 'no-store' garante que o Next.js não guarde cache da resposta da IA
      cache: "no-store", 
    })

    if (!response.ok) {
      console.error(`Erro no n8n: Status ${response.status}`)
      return { error: "O agente encontrou um problema ao processar sua requisição." }
    }

    // Esperamos que o n8n retorne um JSON com a chave 'reply' e o Markdown
    const data = await response.json()
    
    return { 
      success: true, 
      reply: data.reply || "Ação concluída, mas o agente não retornou texto." 
    }

  } catch (error) {
    console.error("Erro de comunicação com o n8n:", error)
    return { error: "Timeout ou falha de rede ao contatar o agente orquestrador." }
  }
}
