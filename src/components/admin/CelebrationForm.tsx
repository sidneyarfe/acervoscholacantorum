import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateCelebration, useUpdateCelebration, Celebration } from "@/hooks/useAdminData";
import {
  useLiturgicalHierarchies,
  useCreateLiturgicalHierarchy,
  useDeleteLiturgicalHierarchy,
} from "@/hooks/useSongOptions";
import { ManageableSelect } from "./ManageableSelect";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const celebrationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  liturgical_rank: z.string().min(1, "Hierarquia litúrgica é obrigatória"),
  feast_type: z.string().optional(),
  date_rule: z.string().optional(),
  description: z.string().optional(),
});

type CelebrationFormData = z.infer<typeof celebrationSchema>;

interface CelebrationFormProps {
  celebration?: Celebration | null;
  onClose: () => void;
}

export function CelebrationForm({ celebration, onClose }: CelebrationFormProps) {
  const createCelebration = useCreateCelebration();
  const updateCelebration = useUpdateCelebration();

  const { data: hierarchies = [], isLoading: loadingHierarchies } = useLiturgicalHierarchies();
  const createHierarchy = useCreateLiturgicalHierarchy();
  const deleteHierarchy = useDeleteLiturgicalHierarchy();

  // Map enum value to display name
  const getHierarchyDisplayName = (value: string) => {
    const hierarchy = hierarchies.find((h) => h.value === value);
    return hierarchy?.name || value;
  };

  const form = useForm<CelebrationFormData>({
    resolver: zodResolver(celebrationSchema),
    defaultValues: {
      name: celebration?.name || "",
      liturgical_rank: celebration?.liturgical_rank || "",
      feast_type: celebration?.feast_type || "",
      date_rule: celebration?.date_rule || "",
      description: celebration?.description || "",
    },
  });

  const onSubmit = async (data: CelebrationFormData) => {
    try {
      // Find the hierarchy to get the value
      const hierarchy = hierarchies.find((h) => h.name === data.liturgical_rank || h.value === data.liturgical_rank);
      const liturgical_rank = (hierarchy?.value || data.liturgical_rank) as "solemnity" | "feast" | "memorial" | "optional_memorial";

      if (celebration) {
        await updateCelebration.mutateAsync({ id: celebration.id, ...data, liturgical_rank });
        toast.success("Celebração atualizada com sucesso");
      } else {
        await createCelebration.mutateAsync({
          name: data.name,
          liturgical_rank,
          feast_type: data.feast_type,
          date_rule: data.date_rule,
          description: data.description,
        });
        toast.success("Celebração criada com sucesso");
      }
      onClose();
    } catch (error) {
      toast.error(celebration ? "Erro ao atualizar celebração" : "Erro ao criar celebração");
    }
  };

  const isSubmitting = createCelebration.isPending || updateCelebration.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome da celebração" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="liturgical_rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hierarquia Litúrgica</FormLabel>
                <FormControl>
                  <ManageableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecione a hierarquia"
                    options={hierarchies}
                    isLoading={loadingHierarchies}
                    onCreate={async (name) => {
                      await createHierarchy.mutateAsync(name);
                    }}
                    onDelete={async (id) => {
                      await deleteHierarchy.mutateAsync(id);
                    }}
                    isCreating={createHierarchy.isPending}
                    isDeleting={deleteHierarchy.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feast_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Festa</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Mariana, Cristológica" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date_rule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regra de Data</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 25 de dezembro, 2º domingo da Páscoa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição da celebração"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {celebration ? "Salvar Alterações" : "Criar Celebração"}
          </Button>
        </div>
      </form>
    </Form>
  );
}