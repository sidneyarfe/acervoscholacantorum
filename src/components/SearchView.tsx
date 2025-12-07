import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { SearchFilters, SearchFiltersState } from "@/components/SearchFilters";
import { useSongs } from "@/hooks/useSongs";
import { useCelebrationSongs } from "@/hooks/useSongCelebrations";
import { Loader2 } from "lucide-react";

interface SearchViewProps {
  onSelectSong: (songId: string) => void;
}

const SUGGESTIONS = [
  "Panis Angelicus",
  "Ave Maria",
  "Kyrie",
  "Corpus Christi",
  "Natal",
  "Gregoriano",
];

const VOICING_TYPE_MAP: Record<string, string> = {
  unison: "Uníssono",
  polyphonic: "Polifônico",
  gregorian: "Gregoriano",
};

const emptyFilters: SearchFiltersState = {
  tag: null,
  celebration: null,
  voiceType: null,
  language: null,
  genre: null,
  texture: null,
};

export function SearchView({ onSelectSong }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersState>(emptyFilters);
  const { data: songs, isLoading } = useSongs();
  
  // Get songs for selected celebration filter
  const { data: celebrationSongs } = useCelebrationSongs(filters.celebration);
  const celebrationSongIds = useMemo(() => 
    celebrationSongs?.map(cs => cs.song?.id).filter(Boolean) || [],
    [celebrationSongs]
  );

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const searchResults = useMemo(() => {
    if (!songs) return [];

    let filtered = [...songs];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((song) => {
        const liturgicalTags = Array.isArray(song.liturgical_tags) 
          ? song.liturgical_tags as string[]
          : [];

        return (
          song.title.toLowerCase().includes(query) ||
          (song.composer && song.composer.toLowerCase().includes(query)) ||
          (song.arranger && song.arranger.toLowerCase().includes(query)) ||
          liturgicalTags.some((tag) => tag.toLowerCase().includes(query)) ||
          (song.genre && song.genre.toLowerCase().includes(query))
        );
      });
    }

    // Apply filters
    if (filters.tag) {
      filtered = filtered.filter((song) => {
        const tags = Array.isArray(song.liturgical_tags) ? song.liturgical_tags as string[] : [];
        return tags.includes(filters.tag!);
      });
    }

    if (filters.celebration && celebrationSongIds.length > 0) {
      filtered = filtered.filter((song) => celebrationSongIds.includes(song.id));
    }

    if (filters.voiceType) {
      const voicingValue = Object.entries(VOICING_TYPE_MAP).find(([_, label]) => label === filters.voiceType)?.[0];
      filtered = filtered.filter((song) => song.voicing_type === voicingValue || song.voicing_type === filters.voiceType);
    }

    if (filters.language) {
      filtered = filtered.filter((song) => song.language === filters.language);
    }

    if (filters.genre) {
      filtered = filtered.filter((song) => song.genre === filters.genre);
    }

    if (filters.texture) {
      filtered = filtered.filter((song) => song.texture === filters.texture);
    }

    return filtered;
  }, [searchQuery, songs, filters, celebrationSongIds]);

  const showResults = searchQuery.trim() || hasActiveFilters;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Buscar" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-6">
        <div className="lg:max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Buscar por título, compositor, celebração..."
          />
        </div>

        {/* Filters */}
        <SearchFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters(emptyFilters)}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : !showResults ? (
          /* Sugestões */
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-lg lg:text-xl font-semibold">Sugestões</h2>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground hover:bg-gold/10 hover:text-gold transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-4">
                Buscar por Categoria
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[
                  { label: "Entrada", icon: "🚪" },
                  { label: "Comunhão", icon: "🍞" },
                  { label: "Ofertório", icon: "🎁" },
                  { label: "Ordinário", icon: "⛪" },
                  { label: "Mariano", icon: "💐" },
                  { label: "Gregoriano", icon: "📜" },
                ].map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSearchQuery(cat.label)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold hover:bg-gold/5 transition-all"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-medium text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Resultados da Busca */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} resultado
              {searchResults.length !== 1 && "s"}
              {searchQuery && ` para "${searchQuery}"`}
              {hasActiveFilters && " com filtros aplicados"}
            </p>

            {searchResults.length > 0 ? (
              <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                {searchResults.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onClick={() => onSelectSong(song.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-muted-foreground">
                  Nenhum resultado encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente outras palavras-chave ou ajuste os filtros
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
