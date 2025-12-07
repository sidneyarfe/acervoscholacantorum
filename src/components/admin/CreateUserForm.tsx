import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreateUser } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { Loader2, Crown, Shield, User } from "lucide-react";

// Função para validar CPF
function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false; // Todos dígitos iguais
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

// Função para validar telefone brasileiro
function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Função para formatar CPF
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// Função para formatar telefone
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  display_name: z.string().min(1, "Nome de exibição é obrigatório"),
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().refine(isValidCPF, { message: "CPF inválido" }),
  phone: z.string().refine(isValidPhone, { message: "Telefone inválido" }),
  address: z.string().optional(),
  join_date: z.string().optional(),
  has_stole: z.boolean().default(false),
  has_vestment: z.boolean().default(false),
  preferred_voice: z.enum(["soprano", "contralto", "tenor", "baixo"], {
    required_error: "Selecione o naipe",
  }),
  role: z.enum(["admin", "moderator", "member"]).default("member"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onClose: () => void;
}

export function CreateUserForm({ onClose }: CreateUserFormProps) {
  const createUser = useCreateUser();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      display_name: "",
      full_name: "",
      cpf: "",
      phone: "",
      address: "",
      join_date: "",
      has_stole: false,
      has_vestment: false,
      preferred_voice: undefined,
      role: "member",
    },
  });

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    onChange(formatCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    onChange(formatPhone(e.target.value));
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        display_name: data.display_name,
        full_name: data.full_name,
        cpf: data.cpf,
        phone: data.phone,
        address: data.address,
        join_date: data.join_date,
        has_stole: data.has_stole,
        has_vestment: data.has_vestment,
        preferred_voice: data.preferred_voice,
        role: data.role,
      });
      toast.success("Usuário criado com sucesso");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de Exibição *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome de exibição" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="000.000.000-00" 
                    value={field.value}
                    onChange={(e) => handleCPFChange(e, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    value={field.value}
                    onChange={(e) => handlePhoneChange(e, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="join_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Entrada na Schola</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naipe *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a voz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="soprano">Soprano</SelectItem>
                    <SelectItem value="contralto">Contralto</SelectItem>
                    <SelectItem value="tenor">Tenor</SelectItem>
                    <SelectItem value="baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço Completo</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, bairro, cidade - UF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Papel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3" />
                      Administrador
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Moderador
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Membro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="has_stole"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Possui Estola</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_vestment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Possui Veste</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Usuário
          </Button>
        </div>
      </form>
    </Form>
  );
}
