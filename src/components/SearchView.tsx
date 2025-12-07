import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { MOCK_SONGS } from "@/lib/data";

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

export function SearchView({ onSelectSong }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return MOCK_SONGS.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.liturgicalTags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        song.celebrations.some((cel) =>
          cel.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery]);

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

        {!searchQuery.trim() ? (
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
                  { label: "Missa Completa", icon: "⛪" },
                  { label: "Marianas", icon: "💐" },
                  { label: "Gregorianas", icon: "📜" },
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
              {searchResults.length !== 1 && "s"} para "{searchQuery}"
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
                  Tente outras palavras-chave
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
