"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createMember, deleteMember, getAllMembers, getAllPlans, updateMember } from "@/lib/services";
import { memberSchema } from "@/lib/validations";
import { Member, Plan } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.infer<typeof memberSchema>;

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);  // Novo estado para os planos
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      plan: "",
      status: "active",
      notes: "",
    },
  });

  // Buscar todos os membros
  const fetchMembers = async () => {
    try {
      const data = await getAllMembers();
      setMembers(data);
      setFilteredMembers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      toast.error("Erro ao carregar membros");
      setIsLoading(false);
    }
  };

  // Buscar todos os planos
  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      toast.error("Erro ao carregar planos");
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, []);

  // Resetar o formulário ao fechar o diálogo
  const resetForm = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      plan: "",
      status: "active",
      notes: "",
    });
    setSelectedMemberId(null);
  };

  // Abrir diálogo para adicionar membro
  const handleAddMember = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar membro
  const handleEditMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      form.reset({
        name: member.name,
        email: member.email || "",
        phone: member.phone,
        birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split("T")[0] : "",
        plan: member.plan,
        status: member.status,
        notes: member.notes || "",
      });
      setSelectedMemberId(id);
      setIsDialogOpen(true);
    }
  };

  // Deletar membro
  const handleDeleteMember = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este membro?")) {
      try {
        await deleteMember(id);
        setMembers((prev) => prev.filter((member) => member.id !== id));
        setFilteredMembers((prev) => prev.filter((member) => member.id !== id));
        toast.success("Membro excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir membro:", error);
        toast.error("Erro ao excluir membro");
      }
    }
  };

  // Salvar membro (criar ou atualizar)
  const onSubmit = async (data: FormValues) => {
    try {
      if (selectedMemberId) {
        // Atualizar membro existente
        await updateMember(selectedMemberId, data);
        setMembers((prev) =>
          prev.map((member) =>
            member.id === selectedMemberId ? { ...member, ...data } : member
          )
        );
        setFilteredMembers((prev) =>
          prev.map((member) =>
            member.id === selectedMemberId ? { ...member, ...data } : member
          )
        );
        toast.success("Membro atualizado com sucesso");
      } else {
        // Criar novo membro
        const newMemberId = await createMember({
          ...data,
          email: data.email || "",
          birthDate: data.birthDate || "",
          notes: data.notes || "",
        });
        const newMember = {
          id: newMemberId,
          ...data,
          registrationDate: new Date().toISOString(),
          lastPaymentDate: null,
          nextPaymentDate: null,
        };
        setMembers((prev) => [
          ...prev,
          {
            ...newMember,
            email: newMember.email || "", 
            birthDate: newMember.birthDate || "", 
            notes: newMember.notes || "",
          } as Member,
        ]);
        setFilteredMembers((prev) => [
          ...prev,
          {
            ...newMember,
            email: newMember.email || "", // Ensure email is a string
            birthDate: newMember.birthDate || "", // Ensure birthDate is a string
            notes: newMember.notes || "", // Ensure notes is a string
          } as Member,
        ]);
        toast.success("Membro criado com sucesso");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
      toast.error("Erro ao salvar membro");
    }
  };

  // Filtrar membros
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredMembers(members);
      return;
    }

    const lowercaseTerm = term.toLowerCase();
    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(lowercaseTerm) ||
        member.email?.toLowerCase().includes(lowercaseTerm) ||
        member.phone.toLowerCase().includes(lowercaseTerm)
    );
    setFilteredMembers(filtered);
  };

  const columns = [
    { header: "Nome", accessor: (member: Member) => member.name },
    { header: "Email", accessor: (member: Member) => member.email || "" },
    { header: "Telefone", accessor: (member: Member) => member.phone },
    {
      header: "Status",
      accessor: (member: Member) => {
        const statusMap = {
          active: <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Ativo</span>,
          inactive: <span className="inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Inativo</span>,
          pending: <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pendente</span>,
        };
        return statusMap[member.status];
      }
    },
    {
      header: "Data de Registro",
      accessor: (member: Member) => {
        let date: Date | string = member.registrationDate;
    
        // Verifica se a data é um timestamp do Firestore
        if (date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
          const timestamp = (date as { seconds: number, nanoseconds: number }).seconds * 1000 +
                            (date as { seconds: number, nanoseconds: number }).nanoseconds / 1000000; // Converte para milissegundos
          date = new Date(timestamp);
        } else if (typeof date === 'string') {
          date = new Date(date); // Converte a string para Date
        }
    
        return !isNaN(new Date(date).getTime()) ? new Date(date).toLocaleDateString('pt-BR') : "Data inválida";
      }
    },    
  ];

  return (
    <div>
      <DataTable<Member>
        columns={columns}
        data={filteredMembers}
        idField="id"
        title="Membros"
        onAdd={handleAddMember}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        searchable
        searchPlaceholder="Buscar por nome, email ou telefone..."
        onSearch={handleSearch}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMemberId ? "Editar Membro" : "Adicionar Membro"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-sm">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...form.register("email")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input type="date" id="birthDate" {...form.register("birthDate")} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="plan">Plano</Label>
                <Select {...form.register("plan")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select {...form.register("status")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observação</Label>
                <Input id="notes" {...form.register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
