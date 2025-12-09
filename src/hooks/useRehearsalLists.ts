import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type RehearsalList = Tables<"rehearsal_lists">;
export type RehearsalListSong = Tables<"rehearsal_list_songs"> & {
  song?: Tables<"songs">;
};

// Fetch all rehearsal lists
export function useRehearsalLists() {
  return useQuery({
    queryKey: ["rehearsal-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rehearsal_lists")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as RehearsalList[];
    },
  });
}

// Fetch single rehearsal list with songs
export function useRehearsalList(id: string | null) {
  return useQuery({
    queryKey: ["rehearsal-list", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("rehearsal_lists")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as RehearsalList;
    },
    enabled: !!id,
  });
}

// Fetch songs for a rehearsal list
export function useRehearsalListSongs(listId: string | null) {
  return useQuery({
    queryKey: ["rehearsal-list-songs", listId],
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await supabase
        .from("rehearsal_list_songs")
        .select(`
          *,
          song:songs(*)
        `)
        .eq("rehearsal_list_id", listId)
        .order("position_order");
      if (error) throw error;
      return data as RehearsalListSong[];
    },
    enabled: !!listId,
  });
}

// Create rehearsal list
export function useCreateRehearsalList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (list: TablesInsert<"rehearsal_lists">) => {
      const { data, error } = await supabase
        .from("rehearsal_lists")
        .insert(list)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-lists"] });
    },
  });
}

// Update rehearsal list
export function useUpdateRehearsalList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"rehearsal_lists"> & { id: string }) => {
      const { data, error } = await supabase
        .from("rehearsal_lists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-lists"] });
      queryClient.invalidateQueries({ queryKey: ["rehearsal-list", variables.id] });
    },
  });
}

// Delete rehearsal list
export function useDeleteRehearsalList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rehearsal_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-lists"] });
    },
  });
}

// Add song to rehearsal list
export function useAddSongToRehearsalList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, songId, notes }: { listId: string; songId: string; notes?: string }) => {
      // Get max position order
      const { data: existing } = await supabase
        .from("rehearsal_list_songs")
        .select("position_order")
        .eq("rehearsal_list_id", listId)
        .order("position_order", { ascending: false })
        .limit(1);
      
      const nextOrder = existing && existing.length > 0 ? existing[0].position_order + 1 : 0;
      
      const { data, error } = await supabase
        .from("rehearsal_list_songs")
        .insert({
          rehearsal_list_id: listId,
          song_id: songId,
          notes: notes || null,
          position_order: nextOrder,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-list-songs", variables.listId] });
    },
  });
}

// Remove song from rehearsal list
export function useRemoveSongFromRehearsalList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listId }: { id: string; listId: string }) => {
      const { error } = await supabase.from("rehearsal_list_songs").delete().eq("id", id);
      if (error) throw error;
      return listId;
    },
    onSuccess: (listId) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-list-songs", listId] });
    },
  });
}

// Update song notes in rehearsal list
export function useUpdateRehearsalListSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, listId, notes }: { id: string; listId: string; notes: string }) => {
      const { data, error } = await supabase
        .from("rehearsal_list_songs")
        .update({ notes })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { data, listId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-list-songs", result.listId] });
    },
  });
}

// Reorder songs in rehearsal list
export function useReorderRehearsalListSongs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, songIds }: { listId: string; songIds: string[] }) => {
      // Update each song's position
      const updates = songIds.map((id, index) =>
        supabase
          .from("rehearsal_list_songs")
          .update({ position_order: index })
          .eq("id", id)
      );
      
      await Promise.all(updates);
      return listId;
    },
    onSuccess: (listId) => {
      queryClient.invalidateQueries({ queryKey: ["rehearsal-list-songs", listId] });
    },
  });
}
