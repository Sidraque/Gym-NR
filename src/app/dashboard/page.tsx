"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllMembers, getAllTrainers, getCheckInsThisMonth, getPaymentsThisMonth } from "@/lib/services";
import { CalendarCheck, CreditCard, Dumbbell, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface CheckIn {
  memberName: string;
  date: string;
}

export default function DashboardPage() {
  const [membersCount, setMembersCount] = useState<number>(0);
  const [trainersCount, setTrainersCount] = useState<number>(0);
  const [paymentsAmount, setPaymentsAmount] = useState<string>("R$ 0");
  const [checkInsCount, setCheckInsCount] = useState<number>(0);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const members = await getAllMembers();
        setMembersCount(members.length);

        const trainers = await getAllTrainers();
        setTrainersCount(trainers.length);

        const payments = await getPaymentsThisMonth();
        setPaymentsAmount(`R$ ${Number(payments).toFixed(2)}`);

        const checkIns = await getCheckInsThisMonth();
        setCheckInsCount(checkIns.length);

        // Criamos um mapa para buscar rapidamente os nomes dos membros
        const membersMap = new Map(members.map((member) => [member.id, member.name]));

        const formattedCheckIns = checkIns.slice(0, 5).map((checkIn) => ({
          memberName: membersMap.get(checkIn.memberId) || "Desconhecido",
          date: new Date(checkIn.date).toLocaleDateString("pt-BR") || "Data não disponível",
        }));
        setRecentCheckIns(formattedCheckIns);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-500">Bem-vindo ao sistema Gym NR de gerenciamento de academia.</p>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Membros" value={membersCount.toString()} description="Total de membros ativos" icon={<Users className="h-6 w-6 text-blue-600" />} />
        <DashboardCard title="Treinadores" value={trainersCount.toString()} description="Treinadores ativos" icon={<Dumbbell className="h-6 w-6 text-green-600" />} />
        <DashboardCard title="Pagamentos" value={paymentsAmount} description="Receita do mês atual" icon={<CreditCard className="h-6 w-6 text-yellow-600" />} />
        <DashboardCard title="Check-ins" value={checkInsCount.toString()} description="Check-ins no mês atual" icon={<CalendarCheck className="h-6 w-6 text-purple-600" />} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Últimos Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimos check-ins da academia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCheckIns.length > 0 ? (
                recentCheckIns.map((checkIn, index) => (
                  <p key={index} className="text-sm">
                    {checkIn.memberName} - {checkIn.date}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">Sem check-ins recentes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente reutilizável para os cards do dashboard
interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function DashboardCard({ title, value, description, icon }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}
