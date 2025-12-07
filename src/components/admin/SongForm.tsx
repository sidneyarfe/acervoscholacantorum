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
import { useCreateSong, useUpdateSong, Song } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSongGenres,
  useSongTextures,
  useSongLanguages,
  useCreateGenre,
  useCreateTexture,
  useCreateLanguage,
  useDeleteGenre,
  useDeleteTexture,
  useDeleteLanguage,
} from "@/hooks/useSongOptions";
import { OptionManager } from "./OptionManager";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const songSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  composer: z.string().optional(),
  arranger: z.string().optional(),
  voicing_type: z.enum(["unison", "polyphonic", "gregorian"]),
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

  // Mutations for managing options
  const createGenre = useCreateGenre();
  const createTexture = useCreateTexture();
  const createLanguage = useCreateLanguage();
  const deleteGenre = useDeleteGenre();
  const deleteTexture = useDeleteTexture();
  const deleteLanguage = useDeleteLanguage();

  const form = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: song?.title || "",
      composer: song?.composer || "",
      arranger: song?.arranger || "",
      voicing_type: song?.voicing_type || "polyphonic",
      texture: song?.texture || "",
      genre: song?.genre || "",
      language: song?.language || "Latim",
      copyright_info: song?.copyright_info || "",
    },
  });

  const onSubmit = async (data: SongFormData) => {
    try {
      if (song) {
        await updateSong.mutateAsync({ id: song.id, ...data });
        toast.success("Música atualizada com sucesso");
      } else {
        await createSong.mutateAsync({
          title: data.title,
          composer: data.composer,
          arranger: data.arranger,
          voicing_type: data.voicing_type,
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unison">Uníssono</SelectItem>
                    <SelectItem value="polyphonic">Polifônico</SelectItem>
                    <SelectItem value="gregorian">Gregoriano</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Idioma</FormLabel>
                  <OptionManager
                    label="Idiomas"
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
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="flex items-center justify-between">
                  <FormLabel>Gênero</FormLabel>
                  <OptionManager
                    label="Gêneros"
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
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g.id} value={g.name}>
                        {g.name}
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
            name="texture"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Textura</FormLabel>
                  <OptionManager
                    label="Texturas"
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
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a textura" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {textures.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
