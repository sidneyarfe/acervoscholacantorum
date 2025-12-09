import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { CelebrationCard } from "@/components/CelebrationCard";
import { SearchFiltersSheet } from "@/components/SearchFiltersSheet";
import { SearchFiltersState } from "@/components/SearchFilters";
import { useSongs } from "@/hooks/useSongs";
import { useCelebrationSongs } from "@/hooks/useSongCelebrations";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useSongTags } from "@/hooks/useSongOptions";
import { Loader2, ArrowLeft, Search, Music, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchViewProps {
  onSelectSong: (songId: string) => void;
  onSelectCelebration?: (celebrationId: string) => void;
}

// Helper function to get icon and gradient for a tag
const getTagStyle = (tagName: string): { icon: string; gradient: string } => {
  const lowerTag = tagName.toLowerCase();
  
  // Momentos litúrgicos
  if (lowerTag.includes("entrada")) return { icon: "🚪", gradient: "from-amber-500/20 to-orange-600/20" };
  if (lowerTag.includes("comunhão") || lowerTag.includes("comunh")) return { icon: "🍞", gradient: "from-rose-500/20 to-pink-600/20" };
  if (lowerTag.includes("ofertório") || lowerTag.includes("ofert")) return { icon: "🎁", gradient: "from-emerald-500/20 to-teal-600/20" };
  if (lowerTag.includes("ordinário") || lowerTag.includes("ordin")) return { icon: "⛪", gradient: "from-blue-500/20 to-indigo-600/20" };
  if (lowerTag.includes("saída") || lowerTag.includes("final")) return { icon: "🌅", gradient: "from-orange-500/20 to-red-600/20" };
  
  // Temas
  if (lowerTag.includes("marian") || lowerTag.includes("nossa senhora")) return { icon: "💐", gradient: "from-violet-500/20 to-purple-600/20" };
  if (lowerTag.includes("natal")) return { icon: "🎄", gradient: "from-green-500/20 to-emerald-600/20" };
  if (lowerTag.includes("páscoa") || lowerTag.includes("pascoa")) return { icon: "✝️", gradient: "from-yellow-500/20 to-amber-600/20" };
  if (lowerTag.includes("advento")) return { icon: "🕯️", gradient: "from-purple-500/20 to-violet-600/20" };
  if (lowerTag.includes("quaresma")) return { icon: "🙏", gradient: "from-slate-500/20 to-gray-600/20" };
  if (lowerTag.includes("pentecostes")) return { icon: "🔥", gradient: "from-red-500/20 to-orange-600/20" };
  
  // Estilos musicais
  if (lowerTag.includes("gregorian")) return { icon: "📜", gradient: "from-stone-500/20 to-zinc-600/20" };
  if (lowerTag.includes("polifon") || lowerTag.includes("polifôn")) return { icon: "🎼", gradient: "from-indigo-500/20 to-blue-600/20" };
  
  // Default
  return { icon: "🎵", gradient: "from-gray-500/20 to-slate-600/20" };
};

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

type SearchType = "songs" | "celebrations";

export function SearchView({ onSelectSong, onSelectCelebration }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersState>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("songs");
  
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: celebrations = [], isLoading: celebrationsLoading } = useCelebrations();
  const { data: tags = [], isLoading: tagsLoading } = useSongTags();
  
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
    setSearchType("songs");
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

  // Song search results
  const songResults = useMemo(() => {
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
        const songTags = Array.isArray(song.liturgical_tags) ? song.liturgical_tags as string[] : [];
        return songTags.includes(filters.tag!);
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

  // Celebration search results
  const celebrationResults = useMemo(() => {
    if (!celebrations) return [];
    if (!searchQuery.trim()) return celebrations;

    const query = searchQuery.toLowerCase();
    return celebrations.filter((celebration) =>
      celebration.name.toLowerCase().includes(query) ||
      celebration.description?.toLowerCase().includes(query) ||
      celebration.feast_type?.toLowerCase().includes(query) ||
      celebration.liturgical_season?.toLowerCase().includes(query)
    );
  }, [searchQuery, celebrations]);

  const isLoading = searchType === "songs" ? songsLoading : celebrationsLoading;

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
            <span className="text-muted-foreground">Buscar músicas ou celebrações...</span>
          </button>

          {/* Category Grid - Dynamic from Database */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Explorar por Categoria</h2>
            {tagsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : tags.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {tags.map((tag) => {
                  const style = getTagStyle(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleCategoryClick(tag.name)}
                      className={cn(
                        "relative overflow-hidden rounded-2xl p-6 text-left transition-all",
                        "bg-gradient-to-br border border-border/50",
                        "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                        style.gradient
                      )}
                    >
                      <span className="text-4xl mb-3 block">{style.icon}</span>
                      <span className="font-display font-semibold text-lg">{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma categoria cadastrada
              </p>
            )}
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
              placeholder={searchType === "songs" ? "Buscar músicas..." : "Buscar celebrações..."}
              filters={searchType === "songs" ? activeFilterLabels : []}
              onRemoveFilter={handleRemoveFilter}
              onOpenFilters={searchType === "songs" ? () => setFiltersOpen(true) : undefined}
            />
          </div>
        </div>

        {/* Search Type Tabs */}
        <div className="px-4 pb-3">
          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as SearchType)}>
            <TabsList className="w-full">
              <TabsTrigger value="songs" className="flex-1 gap-2">
                <Music className="h-4 w-4" />
                Músicas
              </TabsTrigger>
              <TabsTrigger value="celebrations" className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                Celebrações
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : searchType === "songs" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {songResults.length} resultado
              {songResults.length !== 1 && "s"}
              {searchQuery && ` para "${searchQuery}"`}
              {hasActiveFilters && !searchQuery && filters.tag && ` em ${filters.tag}`}
            </p>

            {songResults.length > 0 ? (
              <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                {songResults.map((song) => (
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
                  Nenhuma música encontrada
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente outras palavras-chave ou ajuste os filtros
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {celebrationResults.length} resultado
              {celebrationResults.length !== 1 && "s"}
              {searchQuery && ` para "${searchQuery}"`}
            </p>

            {celebrationResults.length > 0 ? (
              <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                {celebrationResults.map((celebration) => (
                  <CelebrationCard
                    key={celebration.id}
                    celebration={celebration}
                    onClick={() => onSelectCelebration?.(celebration.id)}
                    showArrow
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-muted-foreground">
                  Nenhuma celebração encontrada
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente outras palavras-chave
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {searchType === "songs" && (
        <SearchFiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters(emptyFilters)}
        />
      )}
    </div>
  );
}