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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCelebration, useUpdateCelebration, Celebration } from "@/hooks/useAdminData";
import {
  useLiturgicalHierarchies,
  useCreateLiturgicalHierarchy,
  useDeleteLiturgicalHierarchy,
  useCelebrationTypes,
  useCreateCelebrationType,
  useDeleteCelebrationType,
} from "@/hooks/useSongOptions";
import { ManageableSelect } from "./ManageableSelect";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LITURGICAL_SEASONS = [
  { id: "branco", name: "Branco - Páscoa, Natal, Santos" },
  { id: "verde", name: "Verde - Tempo Comum" },
  { id: "vermelho", name: "Vermelho - Pentecostes, Mártires" },
  { id: "roxo", name: "Roxo - Advento, Quaresma, Finados" },
  { id: "rosa", name: "Rosa - Gaudete, Laetare" },
];

const celebrationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  liturgical_rank: z.string().min(1, "Hierarquia litúrgica é obrigatória"),
  liturgical_season: z.string().optional(),
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

  const { data: celebrationTypes = [], isLoading: loadingTypes } = useCelebrationTypes();
  const createCelebrationType = useCreateCelebrationType();
  const deleteCelebrationType = useDeleteCelebrationType();

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
      liturgical_season: celebration?.liturgical_season || "",
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
        await updateCelebration.mutateAsync({ 
          id: celebration.id, 
          ...data, 
          liturgical_rank,
          liturgical_season: data.liturgical_season || null,
        });
        toast.success("Celebração atualizada com sucesso");
      } else {
        await createCelebration.mutateAsync({
          name: data.name,
          liturgical_rank,
          liturgical_season: data.liturgical_season || null,
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
                <FormLabel>Tipo de Celebração</FormLabel>
                <FormControl>
                  <ManageableSelect
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Selecione o tipo"
                    options={celebrationTypes}
                    isLoading={loadingTypes}
                    onCreate={async (name) => {
                      await createCelebrationType.mutateAsync(name);
                    }}
                    onDelete={async (id) => {
                      await deleteCelebrationType.mutateAsync(id);
                    }}
                    isCreating={createCelebrationType.isPending}
                    isDeleting={deleteCelebrationType.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="liturgical_season"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo Litúrgico (Cor)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tempo litúrgico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LITURGICAL_SEASONS.map(season => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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