import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { useSongs } from "@/hooks/useSongs";
import type { RecentSearch } from "@/hooks/useRecentSearches";

interface RecentSongsProps {
  recentSearches: RecentSearch[];
  onSelectSong: (songId: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  showEmpty?: boolean;
  maxItems?: number;
}

export function RecentSongs({ 
  recentSearches, 
  onSelectSong, 
  onRemove, 
  onClear, 
  showEmpty = false,
  maxItems = 3
}: RecentSongsProps) {
  const { data: songs } = useSongs();

  // Filtrar apenas buscas de músicas que têm itemId
  const songSearches = recentSearches.filter(s => s.type === "song" && s.itemId);
  
  // Buscar os dados das músicas pelos IDs
  const recentSongsWithSearch = songSearches
    .map(search => {
      const song = songs?.find(s => s.id === search.itemId);
      return song ? { song, searchId: search.id } : null;
    })
    .filter(Boolean)
    .slice(0, maxItems);

  if (recentSongsWithSearch.length === 0 && !showEmpty) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-gold" />
          Músicas Recentes
        </h2>
        {recentSongsWithSearch.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>
      
      {recentSongsWithSearch.length > 0 ? (
        <div className="space-y-3">
          {recentSongsWithSearch.map(({ song, searchId }) => (
            <SongCard
              key={searchId}
              song={song}
              onClick={() => onSelectSong(song.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma música acessada recentemente</p>
      )}
    </section>
  );
}
