import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { Badge } from "@/components/ui/badge";
import { useSongs } from "@/hooks/useSongs";
import { useSongsAudioParts } from "@/hooks/useSongAudioParts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LibraryViewProps {
  onSelectSong: (songId: string) => void;
}

const FILTER_TABS = [
  { id: "all", label: "Todos" },
  { id: "polyphonic", label: "SATB" },
  { id: "gregorian", label: "Gregoriano" },
  { id: "unison", label: "Uníssono" },
];

const SONG_CATEGORIES = [
  "Comunhão",
  "Entrada",
  "Ofertório",
  "Ordinário",
  "Mariano",
];

export function LibraryView({ onSelectSong }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: songs, isLoading } = useSongs();
  const songIds = useMemo(() => songs?.map(s => s.id) || [], [songs]);
  const { data: songsAudioParts } = useSongsAudioParts(songIds);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];

    return songs.filter((song) => {
      // Filtro de busca
      const matchesSearch =
        !searchQuery ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.composer && song.composer.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtro de tipo de vozes
      const matchesVoicing =
        activeFilter === "all" || song.voicing_type === activeFilter;

      // Filtros adicionais (liturgical_tags)
      const liturgicalTags = Array.isArray(song.liturgical_tags) 
        ? song.liturgical_tags as string[]
        : [];
      
      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.some((filter) => liturgicalTags.includes(filter));

      return matchesSearch && matchesVoicing && matchesFilters;
    });
  }, [songs, searchQuery, activeFilter, activeFilters]);

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters((prev) => [...prev, filter]);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Repertório" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Busca */}
        <div className="lg:max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            filters={activeFilters}
            onRemoveFilter={removeFilter}
          />
        </div>

        {/* Abas de Filtro */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeFilter === tab.id
                  ? "bg-gold text-primary-foreground shadow-gold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chips de Filtro Rápido */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          {SONG_CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={activeFilters.includes(category) ? "gold" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() =>
                activeFilters.includes(category)
                  ? removeFilter(category)
                  : addFilter(category)
              }
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Contagem de Resultados */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredSongs.length} música{filteredSongs.length !== 1 && "s"}
          </p>
        </div>

        {/* Lista de Músicas - Grid em Desktop */}
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
                  Tente ajustar os filtros
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
