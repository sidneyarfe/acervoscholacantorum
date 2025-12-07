import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SongCelebration = Tables<"song_celebration">;

export interface SongCelebrationWithDetails extends SongCelebration {
  song?: {
    id: string;
    title: string;
    composer: string | null;
    voicing_type: string;
  };
  celebration?: {
    id: string;
    name: string;
    liturgical_rank: string;
  };
}

// Get songs for a specific celebration
export function useCelebrationSongs(celebrationId: string | null) {
  return useQuery({
    queryKey: ["celebration-songs", celebrationId],
    queryFn: async () => {
      if (!celebrationId) return [];
      const { data, error } = await supabase
        .from("song_celebration")
        .select(`
          *,
          song:songs (
            id,
            title,
            composer,
            voicing_type
          )
        `)
        .eq("celebration_id", celebrationId)
        .order("default_order");
      if (error) throw error;
      return data;
    },
    enabled: !!celebrationId,
  });
}

// Get celebrations for a specific song
export function useSongCelebrations(songId: string | null) {
  return useQuery({
    queryKey: ["song-celebrations", songId],
    queryFn: async () => {
      if (!songId) return [];
      const { data, error } = await supabase
        .from("song_celebration")
        .select(`
          *,
          celebration:celebrations (
            id,
            name,
            liturgical_rank
          )
        `)
        .eq("song_id", songId);
      if (error) throw error;
      return data;
    },
    enabled: !!songId,
  });
}

// Link song to celebration
export function useLinkSongToCelebration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      songId,
      celebrationId,
      contextNotes,
      defaultOrder,
    }: {
      songId: string;
      celebrationId: string;
      contextNotes?: string;
      defaultOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from("song_celebration")
        .insert({
          song_id: songId,
          celebration_id: celebrationId,
          context_notes: contextNotes,
          default_order: defaultOrder,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["celebration-songs", variables.celebrationId] });
      queryClient.invalidateQueries({ queryKey: ["song-celebrations", variables.songId] });
    },
  });
}

// Unlink song from celebration
export function useUnlinkSongFromCelebration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      songId,
      celebrationId,
    }: {
      id: string;
      songId: string;
      celebrationId: string;
    }) => {
      const { error } = await supabase
        .from("song_celebration")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["celebration-songs", variables.celebrationId] });
      queryClient.invalidateQueries({ queryKey: ["song-celebrations", variables.songId] });
    },
  });
}
