"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllMembers, getAllTrainers, getCheckInsThisMonth, getPaymentsThisMonth } from "@/lib/services";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarCheck,
  Clock,
  CreditCard,
  Dumbbell,
  RefreshCw,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

interface CheckIn {
  memberId: string;
  memberName: string;
  date: string;
}

interface DashboardData {
  membersCount: number;
  membersLastMonth: number;
  trainersCount: number;
  paymentsAmount: number;
  paymentsLastMonth: number;
  checkInsCount: number;
  checkInsLastMonth: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    membersCount: 0,
    membersLastMonth: 0,
    trainersCount: 0,
    paymentsAmount: 0,
    paymentsLastMonth: 0,
    checkInsCount: 0,
    checkInsLastMonth: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Função para carregar os dados do dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Obter todos os membros
      const members = await getAllMembers();
      
      // Obter treinadores
      const trainers = await getAllTrainers();
      
      // Obter pagamentos deste mês
      const payments = await getPaymentsThisMonth();
      
      // Obter check-ins deste mês
      const checkIns = await getCheckInsThisMonth();
      
      // Simular dados do mês anterior (em um sistema real, seria uma chamada de API diferente)
      const membersLastMonth = members.length - Math.floor(Math.random() * 10);
      const paymentsLastMonth = payments * 0.9;
      const checkInsLastMonth = checkIns.length - Math.floor(Math.random() * 20);
      
      // Atualizar o estado com todos os dados
      setData({
        membersCount: members.length,
        membersLastMonth,
        trainersCount: trainers.length,
        paymentsAmount: payments,
        paymentsLastMonth,
        checkInsCount: checkIns.length,
        checkInsLastMonth
      });
      
      // Criar um mapa para buscar rapidamente os nomes dos membros
      const membersMap = new Map(members.map((member) => [member.id, member.name]));
      
      // Formatar os check-ins recentes
      const formattedCheckIns = checkIns.slice(0, 5).map((checkIn) => ({
        memberId: checkIn.memberId,
        memberName: membersMap.get(checkIn.memberId) || "Desconhecido",
        date: new Date(checkIn.date).toLocaleDateString("pt-BR", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) || "Data não disponível",
      }));
      
      setRecentCheckIns(formattedCheckIns);
      
      // Atualizar horário da última atualização
      setLastUpdated(new Date().toLocaleTimeString("pt-BR"));
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o componente for montado
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calcular variações percentuais
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  const membersDiff = calculatePercentage(data.membersCount, data.membersLastMonth);
  const paymentsDiff = calculatePercentage(data.paymentsAmount, data.paymentsLastMonth);
  const checkInsDiff = calculatePercentage(data.checkInsCount, data.checkInsLastMonth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao sistema Gym NR de gerenciamento de academia</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">
            <Clock className="inline h-3 w-3 mr-1" />
            Atualizado: {lastUpdated || "Carregando..."}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Cards com estatísticas */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <StatCard 
            title="Membros" 
            value={data.membersCount} 
            percentageChange={membersDiff}
            previousValue={data.membersLastMonth}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatCard 
            title="Treinadores" 
            value={data.trainersCount} 
            percentageChange={0} // Sem comparação para treinadores
            icon={<Dumbbell className="h-6 w-6 text-green-600" />}
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatCard 
            title="Pagamentos" 
            value={data.paymentsAmount} 
            percentageChange={paymentsDiff}
            previousValue={data.paymentsLastMonth}
            isCurrency
            icon={<CreditCard className="h-6 w-6 text-yellow-600" />}
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatCard 
            title="Check-ins" 
            value={data.checkInsCount} 
            percentageChange={checkInsDiff}
            previousValue={data.checkInsLastMonth}
            icon={<CalendarCheck className="h-6 w-6 text-purple-600" />}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Seções adicionais */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Atividade Recente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimos check-ins da academia</CardDescription>
                </div>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Esqueleto de carregamento
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentCheckIns.length > 0 ? (
                <div className="space-y-4">
                  {recentCheckIns.map((checkIn, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {checkIn.memberName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{checkIn.memberName}</p>
                        <p className="text-xs text-gray-500">{checkIn.date}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-800 mt-2">
                    Ver todos os check-ins
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">Sem check-ins recentes</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Registrar check-in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Resumo do Desempenho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Resumo do Desempenho</CardTitle>
                  <CardDescription>Comparativo com o mês anterior</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Esqueleto de carregamento
                <div className="space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Item de desempenho: Membros */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Novos Membros</span>
                      <span className={`text-sm font-medium ${membersDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {membersDiff >= 0 ? '+' : ''}{membersDiff}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className={`h-2 rounded ${membersDiff >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(membersDiff), 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {data.membersCount - data.membersLastMonth} novos membros este mês
                    </div>
                  </div>
                  
                  {/* Item de desempenho: Pagamentos */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Receita</span>
                      <span className={`text-sm font-medium ${paymentsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {paymentsDiff >= 0 ? '+' : ''}{paymentsDiff}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className={`h-2 rounded ${paymentsDiff >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(paymentsDiff), 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(data.paymentsAmount - data.paymentsLastMonth).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })} a mais que no mês anterior
                    </div>
                  </div>
                  
                  {/* Item de desempenho: Check-ins */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Frequência</span>
                      <span className={`text-sm font-medium ${checkInsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {checkInsDiff >= 0 ? '+' : ''}{checkInsDiff}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className={`h-2 rounded ${checkInsDiff >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(checkInsDiff), 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {data.checkInsCount - data.checkInsLastMonth} check-ins a mais que no mês anterior
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Componente de card de estatística
interface StatCardProps {
  title: string;
  value: number;
  percentageChange?: number;
  previousValue?: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
  isLoading?: boolean;
}

function StatCard({ 
  title, 
  value, 
  percentageChange, 
  previousValue,
  icon, 
  isCurrency = false,
  isLoading = false
}: StatCardProps) {
  const formattedValue = isCurrency 
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : value.toString();
    
  const formattedPreviousValue = previousValue && isCurrency
    ? previousValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : previousValue?.toString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{formattedValue}</div>
            {percentageChange !== undefined && percentageChange !== 0 && (
              <div className="flex items-center mt-1">
                {percentageChange > 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <p className={`text-xs ${percentageChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(percentageChange)}% em relação ao mês anterior
                </p>
              </div>
            )}
            {percentageChange === 0 && (
              <p className="text-xs text-gray-500">Sem alteração em relação ao mês anterior</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}