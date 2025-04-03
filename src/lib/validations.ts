import { z } from "zod";

// Schema para membros
export const memberSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional(),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }),
  birthDate: z.string().optional(),
  plan: z.string({ required_error: "Selecione um plano" }),
  status: z.enum(["active", "inactive", "pending"], {
    required_error: "Selecione um status"
  }),
  personalTrainer: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para treinadores
export const trainerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional(),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }),
  specialty: z.string().min(2, { message: "Especialidade deve ter pelo menos 2 caracteres" }),
  status: z.enum(["active", "inactive"], {
    required_error: "Selecione um status"
  }),
  schedule: z.string().optional(),
});

// Schema para planos
export const planSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  description: z.string().min(5, { message: "Descrição deve ter pelo menos 5 caracteres" }),
  price: z.coerce.number().positive({ message: "Preço deve ser positivo" }),
  duration: z.coerce.number().positive({ message: "Duração deve ser positiva" }),
  benefits: z.string().transform(str => str.split(',').map(benefit => benefit.trim())),
  active: z.boolean().default(true),
});

// Schema para pagamentos
export const paymentSchema = z.object({
  memberId: z.string({ required_error: "Selecione um membro" }),
  amount: z.coerce.number().positive({ message: "Valor deve ser positivo" }),
  date: z.string(),
  method: z.enum(["credit", "debit", "cash", "pix", "transfer"], {
    required_error: "Selecione um método de pagamento"
  }),
  status: z.enum(["completed", "pending", "failed"], {
    required_error: "Selecione um status"
  }),
  planId: z.string({ required_error: "Selecione um plano" }),
  notes: z.string().optional(),
});

// Schema para check-ins
export const checkInSchema = z.object({
  memberId: z.string({ required_error: "Selecione um membro" }),
});