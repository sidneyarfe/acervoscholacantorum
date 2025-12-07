import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Celebration = Tables<"celebrations">;

export function useCelebrations() {
  return useQuery({
    queryKey: ["celebrations"],
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
