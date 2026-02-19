"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css" // Tema escuro para blocos de código
import { Bot, User } from "lucide-react"

export type MessageRole = "user" | "agent" | "system"

export interface ChatMessageProps {
  id: string
  role: MessageRole
  content: string
  attachments?: { name: string; type: string }[]
}

export function ChatMessage({ role, content, attachments }: ChatMessageProps) {
  const isAgent = role === "agent" || role === "system"

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 md:p-6",
        isAgent ? "bg-muted/50 border-y" : "bg-background"
      )}
    >
      <Avatar className="h-8 w-8 mt-1 border">
        {isAgent ? (
          <>
            <AvatarImage src="/bot-avatar.png" alt="Agent" />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot size={18} />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-muted-foreground/10 text-muted-foreground">
              <User size={18} />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Renderização do Markdown com suporte a GFM (Tabelas, Listas) e Highlighting */}
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-border">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Exibição de Anexos (se houver) */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs border rounded-md px-3 py-1.5 bg-background shadow-sm"
              >
                <span className="truncate max-w-[150px] font-medium">
                  {file.name}
                </span>
                <span className="text-muted-foreground uppercase text-[10px]">
                  {file.type.split("/")[1] || "FILE"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
