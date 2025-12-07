import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Song = Tables<"songs">;
export type Celebration = Tables<"celebrations">;
export type Profile = Tables<"profiles">;
export type UserRole = Tables<"user_roles">;
export type AudioTrack = Tables<"audio_tracks">;
export type Score = Tables<"scores">;

// ===== SONGS =====
export function useAdminSongs() {
  return useQuery({
    queryKey: ["admin-songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("title");
      if (error) throw error;
      return data as Song[];
    },
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (song: TablesInsert<"songs">) => {
      const { data, error } = await supabase
        .from("songs")
        .insert(song)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"songs"> & { id: string }) => {
      const { data, error } = await supabase
        .from("songs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-songs"] });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

// ===== CELEBRATIONS =====
export function useAdminCelebrations() {
  return useQuery({
    queryKey: ["admin-celebrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("celebrations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Celebration[];
    },
  });
}

export function useCreateCelebration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (celebration: TablesInsert<"celebrations">) => {
      const { data, error } = await supabase
        .from("celebrations")
        .insert(celebration)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-celebrations"] });
      queryClient.invalidateQueries({ queryKey: ["celebrations"] });
    },
  });
}

export function useUpdateCelebration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"celebrations"> & { id: string }) => {
      const { data, error } = await supabase
        .from("celebrations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-celebrations"] });
      queryClient.invalidateQueries({ queryKey: ["celebrations"] });
    },
  });
}

export function useDeleteCelebration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("celebrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-celebrations"] });
      queryClient.invalidateQueries({ queryKey: ["celebrations"] });
    },
  });
}

// ===== USERS =====
export interface AdminUser extends Profile {
  role: "admin" | "moderator" | "member";
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name");
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");
      if (rolesError) throw rolesError;

      return profiles.map((profile) => ({
        ...profile,
        role: (roles.find((r) => r.user_id === profile.id)?.role || "member") as "admin" | "moderator" | "member",
      }));
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "moderator" | "member" }) => {
      const { data: existing, error: findError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (findError) throw findError;

      if (existing) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"profiles"> & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// ===== AUDIO TRACKS =====
export function useSongAudioTracks(songId: string | null) {
  return useQuery({
    queryKey: ["audio-tracks", songId],
    queryFn: async () => {
      if (!songId) return [];
      const { data, error } = await supabase
        .from("audio_tracks")
        .select("*")
        .eq("song_id", songId)
        .order("voice_part");
      if (error) throw error;
      return data as AudioTrack[];
    },
    enabled: !!songId,
  });
}

export function useUploadAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      songId,
      voicePart,
      uploaderId,
    }: {
      file: File;
      songId: string;
      voicePart: "soprano" | "contralto" | "tenor" | "baixo" | null;
      uploaderId: string;
    }) => {
      const fileName = `${songId}/${voicePart || "tutti"}_${Date.now()}.${file.name.split(".").pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from("audio-tracks")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("audio-tracks")
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from("audio_tracks")
        .insert({
          song_id: songId,
          voice_part: voicePart,
          file_url: publicUrl,
          uploader_id: uploaderId,
          approved: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["audio-tracks", variables.songId] });
    },
  });
}

export function useDeleteAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, songId }: { id: string; songId: string }) => {
      const { error } = await supabase.from("audio_tracks").delete().eq("id", id);
      if (error) throw error;
      return songId;
    },
    onSuccess: (songId) => {
      queryClient.invalidateQueries({ queryKey: ["audio-tracks", songId] });
    },
  });
}

// ===== SCORES =====
export function useSongScores(songId: string | null) {
  return useQuery({
    queryKey: ["scores", songId],
    queryFn: async () => {
      if (!songId) return [];
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("song_id", songId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Score[];
    },
    enabled: !!songId,
  });
}

export function useUploadScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      songId,
      uploaderId,
    }: {
      file: File;
      songId: string;
      uploaderId: string;
    }) => {
      const fileName = `${songId}/score_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from("scores")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("scores")
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from("scores")
        .insert({
          song_id: songId,
          file_url: publicUrl,
          file_name: file.name, // Armazenar nome original do arquivo
          uploader_id: uploaderId,
          approved: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["scores", variables.songId] });
    },
  });
}

export function useDeleteScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, songId }: { id: string; songId: string }) => {
      const { error } = await supabase.from("scores").delete().eq("id", id);
      if (error) throw error;
      return songId;
    },
    onSuccess: (songId) => {
      queryClient.invalidateQueries({ queryKey: ["scores", songId] });
    },
  });
}
