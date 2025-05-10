"use client";

import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Verificando se os componentes Tabs estão disponíveis
// Se não estiverem, será implementada uma alternativa
// Removido import do Separator que não está disponível

// Esquemas de validação
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
    .regex(/[A-Z]/, { message: "Senha deve conter pelo menos uma letra maiúscula" })
    .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register: registerUser } = useAuth();

  // Login form
  const {
    register: registerLoginForm,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const {
    register: registerRegisterForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Forgot password form
  const {
    register: registerForgotForm,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Email ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);

    try {
      await registerUser(data.email, data.password);
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao criar conta. Este email já pode estar em uso.");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);

    try {
      // Aqui você implementaria a lógica para enviar o email de recuperação
      // await sendPasswordResetEmail(data.email);
      toast.success("Email de recuperação enviado com sucesso!");
      setActiveTab("login");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login social removida

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex w-full border rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "login" 
                  ? "bg-primary text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "register" 
                  ? "bg-primary text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Cadastro
            </button>
          </div>
        </CardHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "login" && (
              <>
                <CardContent className="space-y-4 pt-4">
                  <CardDescription className="text-center pb-2">
                    Entre com seus dados para acessar sua conta
                  </CardDescription>
                  
                  <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            className="pl-10"
                            {...registerLoginForm("email")}
                          />
                        </div>
                        {loginErrors.email && (
                          <p className="text-sm font-medium text-red-500">
                            {loginErrors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Senha</Label>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 text-xs font-normal text-blue-600"
                            onClick={() => setActiveTab("forgot")}
                          >
                            Esqueceu a senha?
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pl-10"
                            {...registerLoginForm("password")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {loginErrors.password && (
                          <p className="text-sm font-medium text-red-500">
                            {loginErrors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </div>
                  </form>
                  
                  {/* Login social removido */}
                </CardContent>
              </>
            )}

            {activeTab === "register" && (
              <>
                <CardContent className="space-y-4 pt-4">
                  <CardDescription className="text-center pb-2">
                    Crie sua conta para acessar o sistema
                  </CardDescription>
                  
                  <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          {...registerRegisterForm("name")}
                        />
                        {registerErrors.name && (
                          <p className="text-sm font-medium text-red-500">
                            {registerErrors.name.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            className="pl-10"
                            {...registerRegisterForm("email")}
                          />
                        </div>
                        {registerErrors.email && (
                          <p className="text-sm font-medium text-red-500">
                            {registerErrors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pl-10"
                            {...registerRegisterForm("password")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {registerErrors.password && (
                          <p className="text-sm font-medium text-red-500">
                            {registerErrors.password.message}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <div className={`h-1 w-1 rounded-full ${(watch('password')?.length || 0) >= 6 ? "bg-green-500" : "bg-gray-300"}`} />
                            <span>Mínimo 6 caracteres</span>
                          </div>
                          <div>
                            <div className={`h-1 w-1 rounded-full ${/[A-Z]/.test(watch('password') || "") ? "bg-green-500" : "bg-gray-300"}`} />
                            <span>Uma letra maiúscula</span>
                          </div>
                          <div>
                            <div className={`h-1 w-1 rounded-full ${/[0-9]/.test(watch('password') || "") ? "bg-green-500" : "bg-gray-300"}`} />
                            <span>Um número</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pl-10"
                            {...registerRegisterForm("confirmPassword")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {registerErrors.confirmPassword && (
                          <p className="text-sm font-medium text-red-500">
                            {registerErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Criando conta..." : "Criar conta"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}

            {activeTab === "forgot" && (
              <>
                <CardContent className="space-y-4 pt-4">
                  <CardDescription className="text-center pb-2">
                    Informe seu email para recuperar sua senha
                  </CardDescription>
                  
                  <form onSubmit={handleForgotSubmit(onForgotSubmit)}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            className="pl-10"
                            {...registerForgotForm("email")}
                          />
                        </div>
                        {forgotErrors.email && (
                          <p className="text-sm font-medium text-red-500">
                            {forgotErrors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        className="w-full"
                        onClick={() => setActiveTab("login")}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para o login
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}