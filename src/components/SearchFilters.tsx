import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import { useSongTags, useSongGenres, useSongTextures, useSongLanguages, useVoiceTypes } from "@/hooks/useSongOptions";
import { useCelebrations } from "@/hooks/useCelebrations";

export interface SearchFiltersState {
  tag: string | null;
  celebration: string | null;
  voiceType: string | null;
  language: string | null;
  genre: string | null;
  texture: string | null;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  onClearFilters: () => void;
}

export function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
  const { data: tags = [] } = useSongTags();
  const { data: celebrations = [] } = useCelebrations();
  const { data: voiceTypes = [] } = useVoiceTypes();
  const { data: languages = [] } = useSongLanguages();
  const { data: genres = [] } = useSongGenres();
  const { data: textures = [] } = useSongTextures();

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const updateFilter = (key: keyof SearchFiltersState, value: string | null) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? null : value });
  };

  const activeFilterLabels: { key: keyof SearchFiltersState; label: string }[] = [];
  if (filters.tag) activeFilterLabels.push({ key: "tag", label: `Tag: ${filters.tag}` });
  if (filters.celebration) {
    const cel = celebrations.find(c => c.id === filters.celebration);
    activeFilterLabels.push({ key: "celebration", label: `Celebração: ${cel?.name || ""}` });
  }
  if (filters.voiceType) activeFilterLabels.push({ key: "voiceType", label: `Tipo: ${filters.voiceType}` });
  if (filters.language) activeFilterLabels.push({ key: "language", label: `Idioma: ${filters.language}` });
  if (filters.genre) activeFilterLabels.push({ key: "genre", label: `Gênero: ${filters.genre}` });
  if (filters.texture) activeFilterLabels.push({ key: "texture", label: `Textura: ${filters.texture}` });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-muted-foreground"
            onClick={onClearFilters}
          >
            Limpar todos
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Select 
          value={filters.tag || "all"} 
          onValueChange={(v) => updateFilter("tag", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Tags</SelectItem>
            {tags.map(t => (
              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.celebration || "all"} 
          onValueChange={(v) => updateFilter("celebration", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Celebração" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Celebrações</SelectItem>
            {celebrations.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.voiceType || "all"} 
          onValueChange={(v) => updateFilter("voiceType", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Tipo de Voz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {voiceTypes.map(v => (
              <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.language || "all"} 
          onValueChange={(v) => updateFilter("language", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Idiomas</SelectItem>
            {languages.map(l => (
              <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.genre || "all"} 
          onValueChange={(v) => updateFilter("genre", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Gêneros</SelectItem>
            {genres.map(g => (
              <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.texture || "all"} 
          onValueChange={(v) => updateFilter("texture", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Textura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Texturas</SelectItem>
            {textures.map(t => (
              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Chips */}
      {activeFilterLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterLabels.map(({ key, label }) => (
            <Badge key={key} variant="secondary" className="gap-1 pr-1">
              {label}
              <button
                onClick={() => updateFilter(key, null)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
