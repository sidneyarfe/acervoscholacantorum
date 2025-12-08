import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { SearchFiltersSheet } from "@/components/SearchFiltersSheet";
import { SearchFiltersState } from "@/components/SearchFilters";
import { useSongs } from "@/hooks/useSongs";
import { useCelebrationSongs } from "@/hooks/useSongCelebrations";
import { useCelebrations } from "@/hooks/useCelebrations";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchViewProps {
  onSelectSong: (songId: string) => void;
}

const CATEGORIES = [
  { label: "Entrada", icon: "🚪", tag: "Entrada" },
  { label: "Comunhão", icon: "🍞", tag: "Comunhão" },
  { label: "Ofertório", icon: "🎁", tag: "Ofertório" },
  { label: "Ordinário", icon: "⛪", tag: "Ordinário" },
  { label: "Mariano", icon: "💐", tag: "Mariano" },
  { label: "Gregoriano", icon: "📜", tag: "Gregoriano" },
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: songs, isLoading } = useSongs();
  const { data: celebrations = [] } = useCelebrations();
  
  // Get songs for selected celebration filter
  const { data: celebrationSongs } = useCelebrationSongs(filters.celebration);
  const celebrationSongIds = useMemo(() => 
    celebrationSongs?.map(cs => cs.song?.id).filter(Boolean) || [],
    [celebrationSongs]
  );

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  // Build active filter labels for SearchBar badges
  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.tag) labels.push(filters.tag);
    if (filters.celebration) {
      const cel = celebrations.find(c => c.id === filters.celebration);
      if (cel) labels.push(cel.name);
    }
    if (filters.voiceType) labels.push(filters.voiceType);
    if (filters.language) labels.push(filters.language);
    if (filters.genre) labels.push(filters.genre);
    if (filters.texture) labels.push(filters.texture);
    return labels;
  }, [filters, celebrations]);

  const handleRemoveFilter = (label: string) => {
    const newFilters = { ...filters };
    if (filters.tag === label) newFilters.tag = null;
    if (celebrations.find(c => c.id === filters.celebration)?.name === label) newFilters.celebration = null;
    if (filters.voiceType === label) newFilters.voiceType = null;
    if (filters.language === label) newFilters.language = null;
    if (filters.genre === label) newFilters.genre = null;
    if (filters.texture === label) newFilters.texture = null;
    setFilters(newFilters);
  };

  const handleCategoryClick = (tag: string) => {
    if (filters.tag === tag) {
      setFilters({ ...filters, tag: null });
    } else {
      setFilters({ ...filters, tag });
    }
  };

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
        {/* Search Bar with Filter Button */}
        <div className="lg:max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Buscar por título, compositor..."
            filters={activeFilterLabels}
            onRemoveFilter={handleRemoveFilter}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : !showResults ? (
          /* Categories - shown when no search/filters active */
          <div className="space-y-4">
            <h2 className="font-display text-lg lg:text-xl font-semibold">Buscar por Categoria</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.tag)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl bg-card border transition-all",
                    filters.tag === cat.tag
                      ? "border-gold bg-gold/10 ring-1 ring-gold/30"
                      : "border-border hover:border-gold hover:bg-gold/5"
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Search Results */
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

      {/* Filters Sheet */}
      <SearchFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(emptyFilters)}
      />
    </div>
  );
}
