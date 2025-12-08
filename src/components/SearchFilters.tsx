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
import { useSongTags, useSongTextures, useSongLanguages } from "@/hooks/useSongOptions";
import { useCelebrations } from "@/hooks/useCelebrations";

export interface SearchFiltersState {
  tag: string | null;
  celebration: string | null;
  voiceType: string | null;
  language: string | null;
  genre: string | null; // Kept for backward compatibility
  texture: string | null;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  onClearFilters: () => void;
}

// Map voicing_type enum to display labels
const VOICING_TYPES = [
  { value: "unison", label: "Uníssono" },
  { value: "polyphonic", label: "Polifônico" },
  { value: "gregorian", label: "Gregoriano" },
];

export function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
  const { data: tags = [] } = useSongTags();
  const { data: celebrations = [] } = useCelebrations();
  const { data: languages = [] } = useSongLanguages();
  const { data: textures = [] } = useSongTextures();

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const updateFilter = (key: keyof SearchFiltersState, value: string | null) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? null : value });
  };

  const activeFilterLabels: { key: keyof SearchFiltersState; label: string }[] = [];
  if (filters.tag) activeFilterLabels.push({ key: "tag", label: filters.tag });
  if (filters.celebration) {
    const cel = celebrations.find(c => c.id === filters.celebration);
    if (cel) activeFilterLabels.push({ key: "celebration", label: cel.name });
  }
  if (filters.voiceType) activeFilterLabels.push({ key: "voiceType", label: filters.voiceType });
  if (filters.language) activeFilterLabels.push({ key: "language", label: filters.language });
  if (filters.texture) activeFilterLabels.push({ key: "texture", label: filters.texture });

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <Select 
          value={filters.tag || "all"} 
          onValueChange={(v) => updateFilter("tag", v)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Momento / Tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Momento / Tema</SelectItem>
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
            <SelectItem value="all">Celebração</SelectItem>
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
            <SelectValue placeholder="Estilo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Estilo</SelectItem>
            {VOICING_TYPES.map(v => (
              <SelectItem key={v.value} value={v.label}>{v.label}</SelectItem>
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
            <SelectItem value="all">Idioma</SelectItem>
            {languages.map(l => (
              <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
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
            <SelectItem value="all">Textura</SelectItem>
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
