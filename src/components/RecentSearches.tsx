import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type: "song" | "celebration";
}

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchClick: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  showEmpty?: boolean;
}

export function RecentSearches({ searches, onSearchClick, onRemove, onClear, showEmpty = false }: RecentSearchesProps) {
  if (searches.length === 0 && !showEmpty) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-gold" />
          Buscas Recentes
        </h2>
        {searches.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>
      {searches.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 text-sm group"
            >
              <button
                onClick={() => onSearchClick(search.query)}
                className="hover:text-foreground transition-colors"
              >
                {search.query}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(search.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma busca recente</p>
      )}
    </section>
  );
}
