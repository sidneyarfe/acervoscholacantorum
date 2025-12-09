import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Loader2, Filter } from "lucide-react";
import { CelebrationCard } from "@/components/CelebrationCard";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useCelebrationTypes } from "@/hooks/useSongOptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CelebrationsViewProps {
  onSelectCelebration?: (celebrationId: string) => void;
}

const LITURGICAL_SEASONS = [
  "Advento",
  "Natal",
  "Quaresma",
  "Páscoa",
  "Tempo Comum",
];

export function CelebrationsView({ onSelectCelebration }: CelebrationsViewProps) {
  const { data: celebrations, isLoading } = useCelebrations();
  const { data: celebrationTypes = [] } = useCelebrationTypes();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredCelebrations = celebrations?.filter(c => {
    if (typeFilter === "all") return true;
    return c.feast_type === typeFilter;
  }) || [];

  // Group celebrations by type for the sidebar
  const celebrationsByType = celebrationTypes.reduce((acc, type) => {
    acc[type.name] = celebrations?.filter(c => c.feast_type === type.name) || [];
    return acc;
  }, {} as Record<string, typeof celebrations>);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Celebrações" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-6 lg:space-y-8">
        {/* Tempos Litúrgicos */}
        <section>
          <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
            Tempos Litúrgicos
          </h2>
          <div className="flex flex-wrap gap-2">
            {LITURGICAL_SEASONS.map((season) => (
              <button
                key={season}
                className="px-4 py-3 rounded-xl bg-parchment border border-gold/20 text-sm font-medium hover:border-gold hover:bg-gold/10 transition-all"
              >
                {season}
              </button>
            ))}
          </div>
        </section>

        {/* Filter by Type */}
        <section>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por Tipo:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {celebrationTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          /* Layout Desktop: Grid */
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Próximas Celebrações */}
            <section className="lg:col-span-2">
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                {typeFilter === "all" ? "Todas as Celebrações" : `Celebrações: ${typeFilter}`}
              </h2>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {filteredCelebrations.map((celebration) => (
                  <CelebrationCard
                    key={celebration.id}
                    celebration={celebration}
                    onClick={() => onSelectCelebration?.(celebration.id)}
                  />
                ))}
                {filteredCelebrations.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-muted-foreground">Nenhuma celebração encontrada</p>
                  </div>
                )}
              </div>
            </section>

            {/* Por Tipo de Celebração */}
            <section className="mt-6 lg:mt-0">
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                Por Tipo de Celebração
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {celebrationTypes.map((type) => (
                  <Card 
                    key={type.id} 
                    variant="interactive"
                    onClick={() => setTypeFilter(type.name)}
                  >
                    <CardContent className="p-4 flex items-center gap-3 lg:gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                        <span className="text-lg">⛪</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{type.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {celebrationsByType[type.name]?.length || 0} celebrações
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
