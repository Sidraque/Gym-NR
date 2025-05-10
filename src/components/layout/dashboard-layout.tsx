"use client";

import { useAuth } from '@/hooks/use-auth';
import {
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Membros', href: '/dashboard/members', icon: Users },
  { name: 'Treinadores', href: '/dashboard/trainers', icon: Dumbbell },
  { name: 'Planos', href: '/dashboard/plans', icon: ClipboardList },
  { name: 'Pagamentos', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Check-ins', href: '/dashboard/checkins', icon: CalendarCheck },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logout realizado com sucesso!");
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">Gym NR</h1>
        <button onClick={toggleMobileMenu} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop always visible, mobile conditional */}
      <div 
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white shadow-md md:shadow-none md:h-screen z-10 md:z-0 ${
          isMobileMenuOpen ? 'absolute inset-0' : ''
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b hidden md:block">
            <h1 className="text-2xl font-bold text-blue-600">Gym NR</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de Gerenciamento</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t mt-auto">
            {user && (
              <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="p-4 text-center text-xs text-gray-500 border-t">
          <p>&copy; {new Date().getFullYear()} Gym NR - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}