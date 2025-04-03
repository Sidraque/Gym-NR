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
import {
  createPayment,
  deletePayment,
  getAllMembers,
  getAllPayments,
  getAllPlans
} from "@/lib/services";
import { paymentSchema } from "@/lib/validations";
import { Member, Payment, Plan } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      method: "cash",
      status: "completed",
      planId: "",
      notes: "",
    },
  });

  // Buscar dados iniciais
  const fetchData = async () => {
    try {
      const [paymentsData, membersData, plansData] = await Promise.all([
        getAllPayments(),
        getAllMembers(),
        getAllPlans(),
      ]);

      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
      setMembers(membersData);
      setPlans(plansData);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Resetar o formulário ao fechar o diálogo
  const resetForm = () => {
    form.reset({
      memberId: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      method: "cash",
      status: "completed",
      planId: "",
      notes: "",
    });
  };

  // Abrir diálogo para adicionar pagamento
  const handleAddPayment = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Pré-preencher valores ao selecionar membro
  const handleMemberChange = (memberId: string) => {
    form.setValue("memberId", memberId);

    const member = members.find(m => m.id === memberId);
    if (member && member.plan) {
      form.setValue("planId", member.plan);

      const plan = plans.find(p => p.id === member.plan);
      if (plan) {
        form.setValue("amount", plan.price);
      }
    }
  };

  // Pré-preencher valores ao selecionar plano
  const handlePlanChange = (planId: string) => {
    form.setValue("planId", planId);

    const plan = plans.find(p => p.id === planId);
    if (plan) {
      form.setValue("amount", plan.price);
    }
  };

  // Salvar pagamento
  const onSubmit = async (data: FormValues) => {
    try {
      await createPayment({
        ...data,
        notes: data.notes ?? null, 
      });

      fetchData();

      toast.success("Pagamento registrado com sucesso");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro ao registrar pagamento");
    }
  };

  // Filtrar pagamentos
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredPayments(payments);
      return;
    }

    const lowercaseTerm = term.toLowerCase();
    const filtered = payments.filter((payment) => {
      const member = members.find((m) => m.id === payment.memberId);
      return (
        member?.name.toLowerCase().includes(lowercaseTerm) ||
        payment.amount.toString().includes(lowercaseTerm) ||
        payment.method.toLowerCase().includes(lowercaseTerm) ||
        payment.status.toLowerCase().includes(lowercaseTerm)
      );
    });
    setFilteredPayments(filtered);
  };

  // Deletar pagamento
  const handleDeletePayment = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pagamento?")) {
      try {
        await deletePayment(id);
        setPayments((prev) => prev.filter((payment) => payment.id !== id));
        setFilteredPayments((prev) => prev.filter((payment) => payment.id !== id));
        toast.success("Pagamento excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir pagamento:", error);
        toast.error("Erro ao excluir pagamento");
      }
    }
  };

  // Editar pagamento
  const handleEditPayment = (id: string) => {
    const payment = payments.find((p) => p.id === id);
    if (payment) {
      form.reset({
        memberId: payment.memberId,
        amount: payment.amount,
        date: new Date(payment.date).toISOString().split("T")[0],
        method: payment.method,
        status: payment.status,
        planId: payment.planId,
        notes: payment.notes || "",
      });
      setIsDialogOpen(true);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("pt-BR");
  };

  const translatePaymentMethod = (method: string) => {
    const methods = {
      credit: "Cartão de Crédito",
      debit: "Cartão de Débito",
      cash: "Dinheiro",
      pix: "Pix",
      transfer: "Transferência"
    };
    return methods[method as keyof typeof methods] || method;
  };

  const translatePaymentStatus = (status: string) => {
    const statuses = {
      completed: <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Concluído</span>,
      pending: <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pendente</span>,
      failed: <span className="inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Falhou</span>
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : "Membro não encontrado";
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : "Plano não encontrado";
  };

  const columns = [
    {
      header: "Membro",
      accessor: (payment: Payment) => getMemberName(payment.memberId)
    },
    {
      header: "Plano",
      accessor: (payment: Payment) => getPlanName(payment.planId)
    },
    {
      header: "Valor",
      accessor: (payment: Payment) => formatCurrency(payment.amount)
    },
    {
      header: "Data",
      accessor: (payment: Payment) => formatDate(payment.date)
    },
    {
      header: "Método",
      accessor: (payment: Payment) => translatePaymentMethod(payment.method)
    },
    {
      header: "Status",
      accessor: (payment: Payment) => translatePaymentStatus(payment.status)
    },
  ];

  return (
    <div>
      <DataTable<Payment>
        columns={columns}
        data={filteredPayments}
        idField="id"
        title="Pagamentos"
        onAdd={handleAddPayment}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        searchable
        searchPlaceholder="Buscar por membro, valor ou método..."
        onSearch={handleSearch}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="memberId">Membro</Label>
                <Select
                  onValueChange={handleMemberChange}
                  defaultValue={form.getValues("memberId")}
                >
                  <SelectTrigger>
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
                {form.formState.errors.memberId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.memberId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="planId">Plano</Label>
                <Select
                  onValueChange={handlePlanChange}
                  defaultValue={form.getValues("planId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.planId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.planId.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">Método de Pagamento</Label>
                <Select
                  onValueChange={(value) => form.setValue("method", value as "credit" | "debit" | "cash" | "pix" | "transfer")}
                  defaultValue={form.getValues("method")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.method && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.method.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value as "completed" | "pending" | "failed")}
                  defaultValue={form.getValues("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" {...form.register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
