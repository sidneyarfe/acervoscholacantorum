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
      // 1. Cria a música no banco
      const { data, error } = await supabase
        .from("songs")
        .insert(song)
        .select()
        .single();
      if (error) throw error;

      // 2. Cria a pasta no Google Drive
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-song-folder`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              songId: data.id,
              title: data.title,
              composer: data.composer,
            }),
          }
        );

        if (!response.ok) {
          console.error("Erro ao criar pasta no Drive:", await response.text());
        }
      } catch (e) {
        console.error("Erro ao criar pasta no Drive:", e);
      }

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
      // Buscar dados atuais da música para verificar se título/compositor mudaram
      const { data: currentSong } = await supabase
        .from("songs")
        .select("title, composer, drive_folder_id")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("songs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Se título ou compositor mudaram e existe pasta no Drive, renomear
      if (
        currentSong?.drive_folder_id &&
        (updates.title !== currentSong.title || updates.composer !== currentSong.composer)
      ) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rename-drive-folder`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({
                folderId: currentSong.drive_folder_id,
                title: updates.title || currentSong.title,
                composer: updates.composer ?? currentSong.composer,
              }),
            }
          );

          if (!response.ok) {
            console.error("Erro ao renomear pasta no Drive:", await response.text());
          }
        } catch (e) {
          console.error("Erro ao renomear pasta no Drive:", e);
        }
      }

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

// Create new user (admin only)
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      display_name: string;
      full_name: string;
      cpf: string;
      phone: string;
      address?: string;
      join_date?: string;
      has_stole?: boolean;
      has_vestment?: boolean;
      preferred_voice: "soprano" | "contralto" | "tenor" | "baixo";
      role?: "admin" | "moderator" | "member";
    }) => {
      // Use edge function to create user (requires service role)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar usuário");
      }

      return response.json();
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
      // Upload para Google Drive via Edge Function
      const formData = new FormData();
      formData.append("file", file);
      formData.append("songId", songId);
      formData.append("voicePart", voicePart || "tutti");
      formData.append("uploaderId", uploaderId);
      formData.append("fileType", "audio");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-drive`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const result = await response.json();
      return result;
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
      // Buscar drive_file_id antes de deletar
      const { data: track } = await supabase
        .from("audio_tracks")
        .select("drive_file_id")
        .eq("id", id)
        .single();

      // Deletar do Google Drive se tiver drive_file_id
      if (track?.drive_file_id) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-from-drive`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({ driveFileId: track.drive_file_id }),
            }
          );
        } catch (e) {
          console.error("Erro ao deletar do Drive:", e);
        }
      }

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
      // Upload para Google Drive via Edge Function
      const formData = new FormData();
      formData.append("file", file);
      formData.append("songId", songId);
      formData.append("uploaderId", uploaderId);
      formData.append("fileType", "score");
      formData.append("fileName", file.name);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-drive`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const result = await response.json();
      return result;
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
      // Buscar drive_file_id antes de deletar
      const { data: score } = await supabase
        .from("scores")
        .select("drive_file_id")
        .eq("id", id)
        .single();

      // Deletar do Google Drive se tiver drive_file_id
      if (score?.drive_file_id) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-from-drive`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({ driveFileId: score.drive_file_id }),
            }
          );
        } catch (e) {
          console.error("Erro ao deletar do Drive:", e);
        }
      }

      const { error } = await supabase.from("scores").delete().eq("id", id);
      if (error) throw error;
      return songId;
    },
    onSuccess: (songId) => {
      queryClient.invalidateQueries({ queryKey: ["scores", songId] });
    },
  });
}
