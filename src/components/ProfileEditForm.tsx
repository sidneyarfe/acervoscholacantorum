import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateProfile, Profile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Loader2, Camera, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// Usuários comuns NÃO podem alterar naipe - apenas informações pessoais básicas
const profileSchema = z.object({
  display_name: z.string().optional(),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditForm({ profile, open, onOpenChange }: ProfileEditFormProps) {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.avatar_url);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile.display_name || "",
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    },
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-profile-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const result = await response.json();
      setPhotoPreview(result.imageUrl);
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Foto atualizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload da foto");
      setPhotoPreview(profile.avatar_url);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        display_name: data.display_name,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
      });
      toast.success("Perfil atualizado com sucesso");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Meu Perfil</DialogTitle>
        </DialogHeader>

        {/* Photo Upload Section */}
        <div className="flex flex-col items-center gap-3 pb-4 border-b">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback className="bg-gold/20 text-gold text-2xl">
                {profile.full_name?.charAt(0)?.toUpperCase() || 
                 profile.display_name?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <p className="text-xs text-muted-foreground">
            Clique no ícone para alterar a foto (JPG, PNG, WEBP - max 5MB)
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input placeholder="Como você quer ser chamado" {...field} />
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
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
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
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu endereço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              Para alterar seu naipe ou outras informações da Schola, entre em contato com o administrador.
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}