"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string, files: File[]) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if ((!input.trim() && files.length === 0) || isLoading) return
    onSendMessage(input, files)
    setInput("")
    setFiles([])
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      // Filtro básico para PDF e Texto (conforme requisito)
      const validFiles = selectedFiles.filter(
        (file) => file.type === "application/pdf" || file.type === "text/plain"
      )
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="relative p-4 bg-background border-t">
      {/* Área de Preview de Arquivos Anexados */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-muted/50 border rounded-md px-3 py-1.5 text-xs shadow-sm">
              <span className="truncate max-w-[150px] font-medium">{file.name}</span>
              <button
                onClick={() => removeFile(idx)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end w-full gap-2 bg-muted/30 border rounded-xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        {/* Botão de Anexo */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="shrink-0 text-muted-foreground hover:text-foreground rounded-full h-9 w-9"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip size={18} />
                <span className="sr-only">Anexar Contexto (PDF/TXT)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Anexar Documentação (PDF ou Texto)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".pdf,.txt"
        />

        {/* Textarea Auto-expansível */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            e.target.style.height = "inherit"
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          onKeyDown={handleKeyDown}
          placeholder="Descreva o app, envie a documentação ou peça para gerar um componente..."
          className="min-h-[40px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 p-2 shadow-none overflow-y-auto"
          disabled={isLoading}
          rows={1}
        />

        {/* Botão de Envio */}
        <Button
          onClick={handleSend}
          disabled={(!input.trim() && files.length === 0) || isLoading}
          size="icon"
          className="shrink-0 h-9 w-9 rounded-full transition-all"
        >
          <Send size={16} className={cn("ml-0.5", isLoading && "animate-pulse")} />
          <span className="sr-only">Enviar Mensagem</span>
        </Button>
      </div>
      <div className="text-center mt-2">
         <span className="text-[10px] text-muted-foreground">O agente pode cometer erros. Verifique o código gerado antes de aplicar em produção.</span>
      </div>
    </div>
  )
}
