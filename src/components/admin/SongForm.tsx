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
import { useCreateSong, useUpdateSong, Song } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSongGenres,
  useSongTextures,
  useSongLanguages,
  useVoiceTypes,
  useCreateGenre,
  useCreateTexture,
  useCreateLanguage,
  useCreateVoiceType,
  useDeleteGenre,
  useDeleteTexture,
  useDeleteLanguage,
  useDeleteVoiceType,
} from "@/hooks/useSongOptions";
import { ManageableSelect } from "./ManageableSelect";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const songSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  composer: z.string().optional(),
  arranger: z.string().optional(),
  voicing_type: z.string().min(1, "Tipo de voz é obrigatório"),
  texture: z.string().optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  copyright_info: z.string().optional(),
});

type SongFormData = z.infer<typeof songSchema>;

interface SongFormProps {
  song?: Song | null;
  onClose: () => void;
}

export function SongForm({ song, onClose }: SongFormProps) {
  const { user } = useAuth();
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();

  // Lookup options
  const { data: genres = [], isLoading: loadingGenres } = useSongGenres();
  const { data: textures = [], isLoading: loadingTextures } = useSongTextures();
  const { data: languages = [], isLoading: loadingLanguages } = useSongLanguages();
  const { data: voiceTypes = [], isLoading: loadingVoiceTypes } = useVoiceTypes();

  // Mutations for managing options
  const createGenre = useCreateGenre();
  const createTexture = useCreateTexture();
  const createLanguage = useCreateLanguage();
  const createVoiceType = useCreateVoiceType();
  const deleteGenre = useDeleteGenre();
  const deleteTexture = useDeleteTexture();
  const deleteLanguage = useDeleteLanguage();
  const deleteVoiceType = useDeleteVoiceType();

  const form = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: song?.title || "",
      composer: song?.composer || "",
      arranger: song?.arranger || "",
      voicing_type: song?.voicing_type || "Polifônico",
      texture: song?.texture || "",
      genre: song?.genre || "",
      language: song?.language || "Latim",
      copyright_info: song?.copyright_info || "",
    },
  });

  const onSubmit = async (data: SongFormData) => {
    try {
      // Map voicing_type to the expected enum value
      const voicingMap: Record<string, "unison" | "polyphonic" | "gregorian"> = {
        "Uníssono": "unison",
        "Polifônico": "polyphonic",
        "Gregoriano": "gregorian",
      };
      const voicing_type = voicingMap[data.voicing_type] || "polyphonic";

      if (song) {
        await updateSong.mutateAsync({ id: song.id, ...data, voicing_type });
        toast.success("Música atualizada com sucesso");
      } else {
        await createSong.mutateAsync({
          title: data.title,
          composer: data.composer,
          arranger: data.arranger,
          voicing_type,
          texture: data.texture,
          genre: data.genre,
          language: data.language,
          copyright_info: data.copyright_info,
          created_by: user?.id,
        });
        toast.success("Música criada com sucesso");
      }
      onClose();
    } catch (error) {
      toast.error(song ? "Erro ao atualizar música" : "Erro ao criar música");
    }
  };

  const isSubmitting = createSong.isPending || updateSong.isPending;

  // Map enum value to display name for editing
  const getVoicingDisplayName = (value: string) => {
    const map: Record<string, string> = {
      unison: "Uníssono",
      polyphonic: "Polifônico",
      gregorian: "Gregoriano",
    };
    return map[value] || value;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input placeholder="Nome da música" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="composer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compositor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do compositor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arranger"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arranjador</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do arranjador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="voicing_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Voz</FormLabel>
                <FormControl>
                  <ManageableSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecione o tipo"
                    options={voiceTypes}
                    isLoading={loadingVoiceTypes}
                    onCreate={async (name) => {
                      await createVoiceType.mutateAsync(name);
                    }}
                    onDelete={async (id) => {
                      await deleteVoiceType.mutateAsync(id);
                    }}
                    isCreating={createVoiceType.isPending}
                    isDeleting={deleteVoiceType.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idioma</FormLabel>
                <FormControl>
                  <ManageableSelect
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Selecione o idioma"
                    options={languages}
                    isLoading={loadingLanguages}
                    onCreate={async (name) => {
                      await createLanguage.mutateAsync(name);
                    }}
                    onDelete={async (id) => {
                      await deleteLanguage.mutateAsync(id);
                    }}
                    isCreating={createLanguage.isPending}
                    isDeleting={deleteLanguage.isPending}
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
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero</FormLabel>
                <FormControl>
                  <ManageableSelect
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Selecione o gênero"
                    options={genres}
                    isLoading={loadingGenres}
                    onCreate={async (name) => {
                      await createGenre.mutateAsync(name);
                    }}
                    onDelete={async (id) => {
                      await deleteGenre.mutateAsync(id);
                    }}
                    isCreating={createGenre.isPending}
                    isDeleting={deleteGenre.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="texture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Textura</FormLabel>
                <FormControl>
                  <ManageableSelect
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Selecione a textura"
                    options={textures}
                    isLoading={loadingTextures}
                    onCreate={async (name) => {
                      await createTexture.mutateAsync(name);
                    }}
                    onDelete={async (id) => {
                      await deleteTexture.mutateAsync(id);
                    }}
                    isCreating={createTexture.isPending}
                    isDeleting={deleteTexture.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="copyright_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informações de Copyright</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações sobre direitos autorais"
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
            {song ? "Salvar Alterações" : "Criar Música"}
          </Button>
        </div>
      </form>
    </Form>
  );
}