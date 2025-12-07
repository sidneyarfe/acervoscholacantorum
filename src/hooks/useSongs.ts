import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Song = Tables<"songs">;

export function useSongs() {
  return useQuery({
    queryKey: ["songs"],
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

export function useSong(id: string | null) {
  return useQuery({
    queryKey: ["song", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Song | null;
    },
    enabled: !!id,
  });
}
