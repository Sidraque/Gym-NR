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
import { createTrainer, deleteTrainer, getAllTrainers, updateTrainer } from "@/lib/services";
import { trainerSchema } from "@/lib/validations";
import { Trainer } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.infer<typeof trainerSchema>;

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      status: "active",
      schedule: "",
    },
  });

  // Buscar todos os treinadores
  const fetchTrainers = async () => {
    try {
      const data = await getAllTrainers();
      setTrainers(data);
      setFilteredTrainers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar treinadores:", error);
      toast.error("Erro ao carregar treinadores");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Resetar o formulário ao fechar o diálogo
  const resetForm = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      status: "active",
      schedule: "",
    });
    setSelectedTrainerId(null);
  };

  // Abrir diálogo para adicionar treinador
  const handleAddTrainer = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar treinador
  const handleEditTrainer = (id: string) => {
    const trainer = trainers.find((t) => t.id === id);
    if (trainer) {
      form.reset({
        name: trainer.name,
        email: trainer.email || "",
        phone: trainer.phone,
        specialty: trainer.specialty,
        status: trainer.status,
        schedule: trainer.schedule || "",
      });
      setSelectedTrainerId(id);
      setIsDialogOpen(true);
    }
  };

  // Deletar treinador
  const handleDeleteTrainer = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este treinador?")) {
      try {
        await deleteTrainer(id);
        setTrainers((prev) => prev.filter((trainer) => trainer.id !== id));
        setFilteredTrainers((prev) => prev.filter((trainer) => trainer.id !== id));
        toast.success("Treinador excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir treinador:", error);
        toast.error("Erro ao excluir treinador");
      }
    }
  };

  // Salvar treinador (criar ou atualizar)
  const onSubmit = async (data: FormValues) => {
    try {
      if (selectedTrainerId) {
        // Atualizar treinador existente
        await updateTrainer(selectedTrainerId, data);
        setTrainers((prev) =>
          prev.map((trainer) =>
            trainer.id === selectedTrainerId ? { ...trainer, ...data } : trainer
          )
        );
        setFilteredTrainers((prev) =>
          prev.map((trainer) =>
            trainer.id === selectedTrainerId ? { ...trainer, ...data } : trainer
          )
        );
        toast.success("Treinador atualizado com sucesso");
      } else {
        // Criar novo treinador
        const newTrainerId = await createTrainer({
          ...data,
          email: data.email || "",
          schedule: data.schedule ?? null,
        });
        const newTrainer: Trainer = {
          id: newTrainerId,
          name: data.name,
          email: data.email || "",
          phone: data.phone,
          specialty: data.specialty,
          status: data.status,
          schedule: data.schedule || "",
          hireDate: new Date().toISOString(),
        };
        setTrainers((prev) => [...prev, newTrainer]);
        setFilteredTrainers((prev) => [...prev, newTrainer]);
        toast.success("Treinador criado com sucesso");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar treinador:", error);
      toast.error("Erro ao salvar treinador");
    }
  };

  // Filtrar treinadores
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredTrainers(trainers);
      return;
    }

    const lowercaseTerm = term.toLowerCase();
    const filtered = trainers.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(lowercaseTerm) ||
        trainer.email?.toLowerCase().includes(lowercaseTerm) ||
        trainer.specialty.toLowerCase().includes(lowercaseTerm)
    );
    setFilteredTrainers(filtered);
  };

  const columns = [
    { header: "Nome", accessor: (trainer: Trainer) => trainer.name },
    { header: "Email", accessor: (trainer: Trainer) => trainer.email || "" },
    { header: "Telefone", accessor: (trainer: Trainer) => trainer.phone },
    { header: "Especialidade", accessor: (trainer: Trainer) => trainer.specialty },
    {
      header: "Status",
      accessor: (trainer: Trainer) => {
        return trainer.status === "active" ? (
          <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            Ativo
          </span>
        ) : (
          <span className="inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
            Inativo
          </span>
        );
      },
    },
    {
      header: "Data de Contratação",
      accessor: (trainer: Trainer) => {
        let date: Date | string = trainer.hireDate;
    
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
      <DataTable<Trainer>
        columns={columns}
        data={filteredTrainers}
        idField="id"
        title="Treinadores"
        onAdd={handleAddTrainer}
        onEdit={handleEditTrainer}
        onDelete={handleDeleteTrainer}
        searchable
        searchPlaceholder="Buscar por nome, email ou especialidade..."
        onSearch={handleSearch}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTrainerId ? "Editar Treinador" : "Adicionar Treinador"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input id="specialty" {...form.register("specialty")} />
                {form.formState.errors.specialty && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.specialty.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value as "active" | "inactive")}
                  defaultValue={form.getValues("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule">Horário/Agenda</Label>
                <Input id="schedule" {...form.register("schedule")} />
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
