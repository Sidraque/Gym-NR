"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCheckIn, getAllMembers, getMemberCheckIns } from "@/lib/services";
import { CheckIn, Member } from "@/types";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckInsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar todos os membros
  const fetchMembers = async () => {
    try {
      const data = await getAllMembers();
      setMembers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      toast.error("Erro ao carregar membros");
      setIsLoading(false);
    }
  };

  // Buscar check-ins do membro selecionado
  const fetchMemberCheckIns = async (memberId: string) => {
    if (!memberId) return;

    try {
      const data = await getMemberCheckIns(memberId);
      setCheckIns(data);
    } catch (error) {
      console.error("Erro ao buscar check-ins:", error);
      toast.error("Erro ao carregar check-ins");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberCheckIns(selectedMemberId);
    } else {
      setCheckIns([]);
    }
  }, [selectedMemberId]);

  // Registrar novo check-in
  const handleCheckIn = async () => {
    if (!selectedMemberId) {
      toast.error("Selecione um membro para fazer check-in");
      return;
    }

    setIsSubmitting(true);

    try {
      await createCheckIn(selectedMemberId);
      fetchMemberCheckIns(selectedMemberId);
      toast.success("Check-in realizado com sucesso");
    } catch (error) {
      console.error("Erro ao registrar check-in:", error);
      toast.error("Erro ao registrar check-in");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar data e hora para exibição
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("pt-BR");
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Obter iniciais do nome para o avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Seção para registrar check-in */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Check-ins</h1>
        <Card>
          <CardHeader>
            <CardTitle>Registrar Check-in</CardTitle>
            <CardDescription>
              Selecione um membro e registre sua entrada na academia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Seletor de membro */}
              <Select
                onValueChange={(value) => setSelectedMemberId(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Botão de registrar check-in */}
              <Button
                onClick={handleCheckIn}
                disabled={!selectedMemberId || isSubmitting}
                className="flex items-center gap-2"
              >
                <CheckCircle size={16} />
                {isSubmitting ? "Processando..." : "Registrar Check-in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção para exibir histórico de check-ins */}
      {selectedMemberId && (
        <div>
          <h2 className="text-xl font-bold mb-4">Histórico de Check-ins</h2>
          {checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((checkIn) => {
                const member = members.find((m) => m.id === checkIn.memberId);

                return (
                  <Card key={checkIn.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar do membro */}
                        <Avatar>
                          <AvatarFallback>
                            {member ? getInitials(member.name) : "??"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Informações do check-in */}
                        <div>
                          <p className="font-medium">{member?.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(checkIn.date)} às {formatTime(checkIn.time)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Nenhum check-in registrado para este membro.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
