import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LookupOption {
  id: string;
  name: string;
}

// ===== GENRES =====
export function useSongGenres() {
  return useQuery({
    queryKey: ["song-genres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_genres")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("song_genres")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-genres"] });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("song_genres").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-genres"] });
    },
  });
}

// ===== TEXTURES =====
export function useSongTextures() {
  return useQuery({
    queryKey: ["song-textures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_textures")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateTexture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("song_textures")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-textures"] });
    },
  });
}

export function useDeleteTexture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("song_textures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-textures"] });
    },
  });
}

// ===== LANGUAGES =====
export function useSongLanguages() {
  return useQuery({
    queryKey: ["song-languages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_languages")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("song_languages")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-languages"] });
    },
  });
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("song_languages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-languages"] });
    },
  });
}
