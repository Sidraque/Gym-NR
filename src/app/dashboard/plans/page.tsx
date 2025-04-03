"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createPlan, deletePlan, getAllPlans, updatePlan } from "@/lib/services";
import { planSchema } from "@/lib/validations";
import { Plan } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.infer<typeof planSchema>;

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 1,
      benefits: [],
      active: true,
    },
  });

  const fetchPlans = useCallback(async () => {
    try {
      const data = await getAllPlans();
      setPlans(data);
      setFilteredPlans(data);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      toast.error("Erro ao carregar planos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      duration: 1,
      benefits: [],
      active: true,
    });
    setSelectedPlanId(null);
  };

  const handleAddPlan = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditPlan = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (plan) {
      form.reset({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        benefits: plan.benefits,
        active: plan.active,
      });
      setSelectedPlanId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDeletePlan = useCallback(async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este plano?")) {
      try {
        await deletePlan(id);
        setPlans((prev) => prev.filter((plan) => plan.id !== id));
        setFilteredPlans((prev) => prev.filter((plan) => plan.id !== id));
        toast.success("Plano excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir plano:", error);
        toast.error("Erro ao excluir plano");
      }
    }
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      data.benefits = data.benefits.map((b) => b.trim());
      if (selectedPlanId) {
        await updatePlan(selectedPlanId, data);
      } else {
        const newPlanId = await createPlan(data);
        setPlans((prev) => [...prev, { id: newPlanId, ...data }]);
      }
      toast.success(selectedPlanId ? "Plano atualizado com sucesso" : "Plano criado com sucesso");
      resetForm();
      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Erro ao salvar plano");
    }
  };

  const handleSearch = useCallback((term: string) => {
    const searchTerm = term.toLowerCase();
    setFilteredPlans(
      plans.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchTerm) ||
          plan.description.toLowerCase().includes(searchTerm)
      )
    );
  }, [plans]);

  interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => string | number | boolean);
  }

  const columns: Column<Plan>[] = [
    { header: "Nome", accessor: "name" },
    { header: "Descrição", accessor: "description" },
    { header: "Preço (R$)", accessor: "price" },
    { header: "Duração (meses)", accessor: "duration" },
    {
      header: "Status",
      accessor: (plan) => (plan.active ? "Ativo" : "Inativo"),
    },
  ];

  return (
    <div>
      <DataTable<Plan>
        columns={columns}
        data={filteredPlans}
        idField="id"
        title="Planos"
        onAdd={handleAddPlan}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
        searchable
        searchPlaceholder="Buscar por nome ou descrição..."
        onSearch={handleSearch}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPlanId ? "Editar Plano" : "Adicionar Plano"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <Label>Nome</Label>
              <Input {...form.register("name")} />
              <Label>Descrição</Label>
              <Input {...form.register("description")} />
              <Label>Preço (R$)</Label>
              <Input type="number" step="0.01" {...form.register("price")} />
              <Label>Duração (meses)</Label>
              <Input type="number" min="1" {...form.register("duration")} />
              <Label>Benefícios (separados por vírgula)</Label>
              <Input {...form.register("benefits")} />
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={form.watch("active")}
                  onCheckedChange={(checked) => form.setValue("active", checked)}
                />
                <Label>Plano ativo</Label>
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
