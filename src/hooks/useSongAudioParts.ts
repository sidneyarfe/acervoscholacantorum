import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VOICE_LABELS: Record<string, string> = {
  soprano: "Soprano",
  contralto: "Contralto",
  tenor: "Tenor",
  baixo: "Baixo",
};

export function useSongAudioParts(songId: string | null) {
  return useQuery({
    queryKey: ["song-audio-parts", songId],
    queryFn: async () => {
      if (!songId) return [];
      
      const { data, error } = await supabase
        .from("audio_tracks")
        .select("voice_part")
        .eq("song_id", songId)
        .eq("approved", true);
      
      if (error) throw error;
      
      const voiceParts = data
        .map(track => track.voice_part as string | null)
        .filter((part): part is string => part !== null);
      
      // Return unique voice parts with labels
      const uniqueParts = [...new Set(voiceParts)];
      return uniqueParts.map(part => ({
        id: part,
        label: VOICE_LABELS[part] || part,
      }));
    },
    enabled: !!songId,
  });
}

// Hook to get audio parts for multiple songs at once (more efficient)
export function useSongsAudioParts(songIds: string[]) {
  return useQuery({
    queryKey: ["songs-audio-parts", songIds],
    queryFn: async () => {
      if (!songIds.length) return {};
      
      const { data, error } = await supabase
        .from("audio_tracks")
        .select("song_id, voice_part")
        .in("song_id", songIds)
        .eq("approved", true);
      
      if (error) throw error;
      
      // Group by song_id
      const result: Record<string, string[]> = {};
      data.forEach(track => {
        if (!track.voice_part) return;
        if (!result[track.song_id]) {
          result[track.song_id] = [];
        }
        if (!result[track.song_id].includes(track.voice_part)) {
          result[track.song_id].push(track.voice_part);
        }
      });
      
      return result;
    },
    enabled: songIds.length > 0,
  });
}
