import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LookupOption {
  id: string;
  name: string;
  value?: string;
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

// ===== VOICE TYPES =====
export function useVoiceTypes() {
  return useQuery({
    queryKey: ["voice-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateVoiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("voice_types")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-types"] });
    },
  });
}

export function useDeleteVoiceType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("voice_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-types"] });
    },
  });
}

// ===== LITURGICAL HIERARCHIES =====
export function useLiturgicalHierarchies() {
  return useQuery({
    queryKey: ["liturgical-hierarchies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("liturgical_hierarchies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateLiturgicalHierarchy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const value = name.toLowerCase().replace(/\s+/g, "_");
      const { data, error } = await supabase
        .from("liturgical_hierarchies")
        .insert({ name, value })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liturgical-hierarchies"] });
    },
  });
}

export function useDeleteLiturgicalHierarchy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("liturgical_hierarchies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liturgical-hierarchies"] });
    },
  });
}

// ===== SONG TAGS =====
export function useSongTags() {
  return useQuery({
    queryKey: ["song-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateSongTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("song_tags")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-tags"] });
    },
  });
}

export function useDeleteSongTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("song_tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-tags"] });
    },
  });
}

// ===== CELEBRATION TYPES =====
export function useCelebrationTypes() {
  return useQuery({
    queryKey: ["celebration-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("celebration_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as LookupOption[];
    },
  });
}

export function useCreateCelebrationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("celebration_types")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["celebration-types"] });
    },
  });
}

export function useDeleteCelebrationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("celebration_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["celebration-types"] });
    },
  });
}