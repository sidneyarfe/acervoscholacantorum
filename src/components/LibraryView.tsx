import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { Badge } from "@/components/ui/badge";
import { MOCK_SONGS, LITURGICAL_SEASONS, SONG_CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

interface LibraryViewProps {
  onSelectSong: (songId: string) => void;
}

const FILTER_TABS = [
  { id: "all", label: "Todos" },
  { id: "polyphonic", label: "SATB" },
  { id: "gregorian", label: "Gregoriano" },
  { id: "unison", label: "Uníssono" },
];

export function LibraryView({ onSelectSong }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filteredSongs = useMemo(() => {
    return MOCK_SONGS.filter((song) => {
      // Search query filter
      const matchesSearch =
        !searchQuery ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.liturgicalTags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Voicing type filter
      const matchesVoicing =
        activeFilter === "all" || song.voicingType === activeFilter;

      // Additional filters
      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.some(
          (filter) =>
            song.liturgicalTags.includes(filter) ||
            song.celebrations.includes(filter)
        );

      return matchesSearch && matchesVoicing && matchesFilters;
    });
  }, [searchQuery, activeFilter, activeFilters]);

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters((prev) => [...prev, filter]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header title="Repertório" showLogo={false} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          filters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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

        {/* Quick Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {SONG_CATEGORIES.slice(0, 5).map((category) => (
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

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredSongs.length} música{filteredSongs.length !== 1 && "s"}
          </p>
        </div>

        {/* Song List */}
        <div className="space-y-3">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => onSelectSong(song.id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma música encontrada
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
