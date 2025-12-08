import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { SearchFiltersSheet } from "@/components/SearchFiltersSheet";
import { SearchFiltersState } from "@/components/SearchFilters";
import { useSongs } from "@/hooks/useSongs";
import { useCelebrationSongs } from "@/hooks/useSongCelebrations";
import { useCelebrations } from "@/hooks/useCelebrations";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchViewProps {
  onSelectSong: (songId: string) => void;
}

const CATEGORIES = [
  { label: "Entrada", icon: "🚪", tag: "Entrada", gradient: "from-amber-500/20 to-orange-600/20" },
  { label: "Comunhão", icon: "🍞", tag: "Comunhão", gradient: "from-rose-500/20 to-pink-600/20" },
  { label: "Ofertório", icon: "🎁", tag: "Ofertório", gradient: "from-emerald-500/20 to-teal-600/20" },
  { label: "Ordinário", icon: "⛪", tag: "Ordinário", gradient: "from-blue-500/20 to-indigo-600/20" },
  { label: "Mariano", icon: "💐", tag: "Mariano", gradient: "from-violet-500/20 to-purple-600/20" },
  { label: "Gregoriano", icon: "📜", tag: "Gregoriano", gradient: "from-stone-500/20 to-zinc-600/20" },
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
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { data: songs, isLoading } = useSongs();
  const { data: celebrations = [] } = useCelebrations();
  
  const { data: celebrationSongs } = useCelebrationSongs(filters.celebration);
  const celebrationSongIds = useMemo(() => 
    celebrationSongs?.map(cs => cs.song?.id).filter(Boolean) || [],
    [celebrationSongs]
  );

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

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
    
    // Return to browse if no filters left
    if (Object.values(newFilters).every(v => v === null) && !searchQuery) {
      setIsSearchMode(false);
    }
  };

  const handleCategoryClick = (tag: string) => {
    setFilters({ ...emptyFilters, tag });
    setIsSearchMode(true);
  };

  const handleBack = () => {
    setSearchQuery("");
    setFilters(emptyFilters);
    setIsSearchMode(false);
  };

  const handleSearchFocus = () => {
    setIsSearchMode(true);
  };

  const searchResults = useMemo(() => {
    if (!songs) return [];

    let filtered = [...songs];

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

  // Browse Mode - Category Selection
  if (!isSearchMode) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Buscar" showLogo={false} />
        
        <main className="flex-1 px-4 lg:px-8 py-6 space-y-6">
          {/* Quick Search Bar */}
          <button
            onClick={handleSearchFocus}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-gold/50 transition-colors text-left"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Buscar músicas, compositores...</span>
          </button>

          {/* Category Grid */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Explorar por Categoria</h2>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.tag)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-6 text-left transition-all",
                    "bg-gradient-to-br border border-border/50",
                    "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                    cat.gradient
                  )}
                >
                  <span className="text-4xl mb-3 block">{cat.icon}</span>
                  <span className="font-display font-semibold text-lg">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Search/Results Mode
  return (
    <div className="flex flex-col min-h-screen">
      {/* Custom Header with Back Button */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Buscar músicas..."
              filters={activeFilterLabels}
              onRemoveFilter={handleRemoveFilter}
              onOpenFilters={() => setFiltersOpen(true)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} resultado
              {searchResults.length !== 1 && "s"}
              {searchQuery && ` para "${searchQuery}"`}
              {hasActiveFilters && !searchQuery && filters.tag && ` em ${filters.tag}`}
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
