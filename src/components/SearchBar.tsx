import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  filters?: string[];
  onRemoveFilter?: (filter: string) => void;
  onOpenFilters?: () => void;
  onSubmit?: (value: string) => void;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Buscar músicas, compositores...",
  filters = [],
  onRemoveFilter,
  onOpenFilters,
  onSubmit,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && onSubmit) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-20 h-12 rounded-xl border-border bg-card",
            "focus:border-gold focus:ring-gold/20",
            "placeholder:text-muted-foreground"
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {onOpenFilters && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg",
                filters.length > 0 && "text-gold"
              )}
              onClick={onOpenFilters}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant="gold"
              className="pl-2 pr-1 py-1 flex items-center gap-1 cursor-pointer hover:bg-gold/20"
              onClick={() => onRemoveFilter?.(filter)}
            >
              {filter}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
