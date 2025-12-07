import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAudioCount() {
  return useQuery({
    queryKey: ["audio-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("audio_tracks")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });
}
