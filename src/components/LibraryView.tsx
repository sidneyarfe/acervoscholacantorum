import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { Badge } from "@/components/ui/badge";
import { useSongs } from "@/hooks/useSongs";
import { useSongsAudioParts } from "@/hooks/useSongAudioParts";
import { useSongTags } from "@/hooks/useSongOptions";
import { Loader2 } from "lucide-react";

interface LibraryViewProps {
  onSelectSong: (songId: string) => void;
}

export function LibraryView({ onSelectSong }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: songs, isLoading } = useSongs();
  const { data: tags = [] } = useSongTags();
  const songIds = useMemo(() => songs?.map(s => s.id) || [], [songs]);
  const { data: songsAudioParts } = useSongsAudioParts(songIds);

  // Calculate tag counts based on songs
  const tagCounts = useMemo(() => {
    if (!songs) return {};
    const counts: Record<string, number> = {};
    songs.forEach((song) => {
      const songTags = Array.isArray(song.liturgical_tags) ? song.liturgical_tags as string[] : [];
      songTags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [songs]);

  // Get top tags sorted by count
  const topTags = useMemo(() => {
    return tags
      .filter((tag) => tagCounts[tag.name] > 0)
      .sort((a, b) => (tagCounts[b.name] || 0) - (tagCounts[a.name] || 0))
      .slice(0, 8);
  }, [tags, tagCounts]);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];

    return songs.filter((song) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.composer && song.composer.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const liturgicalTags = Array.isArray(song.liturgical_tags) 
        ? song.liturgical_tags as string[]
        : [];
      const matchesTag = !selectedTag || liturgicalTags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [songs, searchQuery, selectedTag]);

  const handleTagClick = (tagName: string) => {
    setSelectedTag(selectedTag === tagName ? null : tagName);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Repertório" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Search */}
        <div className="lg:max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Buscar músicas..."
          />
        </div>

        {/* Tag Selector */}
        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.name ? "gold" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
                <span className="ml-1 text-xs opacity-70">
                  ({tagCounts[tag.name] || 0})
                </span>
              </Badge>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredSongs.length} música{filteredSongs.length !== 1 && "s"}
            {selectedTag && ` em "${selectedTag}"`}
          </p>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-sm text-gold hover:underline"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {/* Song List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onClick={() => onSelectSong(song.id)}
                  audioVoices={songsAudioParts?.[song.id] || []}
                />
              ))
            ) : (
              <div className="text-center py-12 lg:col-span-full">
                <p className="text-muted-foreground">
                  Nenhuma música encontrada
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar a busca ou os filtros
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
