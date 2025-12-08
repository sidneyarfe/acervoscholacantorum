import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSongTags, useSongTextures, useSongLanguages } from "@/hooks/useSongOptions";
import { useCelebrations } from "@/hooks/useCelebrations";
import { SearchFiltersState } from "@/components/SearchFilters";

interface SearchFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function SearchFiltersSheet({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: SearchFiltersSheetProps) {
  const { data: tags = [] } = useSongTags();
  const { data: celebrations = [] } = useCelebrations();
  const { data: languages = [] } = useSongLanguages();
  const { data: textures = [] } = useSongTextures();

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  const updateFilter = (key: keyof SearchFiltersState, value: string | null) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? null : value });
  };

  const handleApply = () => {
    onOpenChange(false);
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display">Filtros de Busca</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto flex-1 pb-20">
          {/* Tag / Momento Litúrgico */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Momento / Tema</Label>
            <Select 
              value={filters.tag || "all"} 
              onValueChange={(v) => updateFilter("tag", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {tags.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Celebration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Celebração</Label>
            <Select 
              value={filters.celebration || "all"} 
              onValueChange={(v) => updateFilter("celebration", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {celebrations.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estilo (voicing_type - replaces voice_types table) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estilo</Label>
            <Select 
              value={filters.voiceType || "all"} 
              onValueChange={(v) => updateFilter("voiceType", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {VOICING_TYPES.map(v => (
                  <SelectItem key={v.value} value={v.label}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Idioma</Label>
            <Select 
              value={filters.language || "all"} 
              onValueChange={(v) => updateFilter("language", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {languages.map(l => (
                  <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Texture */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Textura</Label>
            <Select 
              value={filters.texture || "all"} 
              onValueChange={(v) => updateFilter("texture", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {textures.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-3">
          {hasActiveFilters && (
            <Button variant="outline" className="flex-1" onClick={handleClear}>
              Limpar Filtros
            </Button>
          )}
          <Button className="flex-1" onClick={handleApply}>
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
