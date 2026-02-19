"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { LoginSchema, RegisterSchema } from "@/schemas/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"

export async function login(values: z.infer<typeof LoginSchema>) {
  // Validação Zod no servidor (Double Validation)
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" }
  }

  const { email, password } = validatedFields.data

  try {
    // Tenta autenticar usando o provider "credentials" configurado no auth.config.ts
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT, // Usa a constante centralizada ("/dashboard")
    })
  } catch (error) {
    // NextAuth lança AuthError para falhas de autenticação
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas." }
        default:
          return { error: "Ocorreu um erro inesperado durante o login." }
      }
    }
    
    // ATENÇÃO: Se o erro NÃO for um AuthError (por exemplo, um erro de redirecionamento 
    // interno NEXT_REDIRECT lançado propositalmente pelo signIn em caso de sucesso),
    // ele DEVE ser re-lançado para que a navegação do Next.js funcione.
    throw error
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  // Validação Zod no servidor
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" }
  }

  const { email, password, name } = validatedFields.data

  // Verifica se o usuário já existe no banco (evita duplicação)
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: "E-mail já está em uso." }
  }

  // Hash da senha com salt round de 10 (Equilíbrio ideal entre segurança e performance)
  const hashedPassword = await bcrypt.hash(password, 10)

  // Criação do registro do usuário no PostgreSQL
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  })

  return { success: "Conta criada com sucesso! Você já pode fazer login." }
}

export async function loginWithGoogle() {
  // O redirecionamento após o OAuth também utiliza a constante centralizada
  await signIn("google", { redirectTo: DEFAULT_LOGIN_REDIRECT })
}
