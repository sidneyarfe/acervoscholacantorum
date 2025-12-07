import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Loader2 } from "lucide-react";
import { useCelebrations } from "@/hooks/useCelebrations";

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

const LITURGICAL_RANK_LABELS: Record<string, string> = {
  solemnity: "Solenidade",
  feast: "Festa",
  memorial: "Memorial",
  optional_memorial: "Memorial Opcional",
};

export function CelebrationsView({ onSelectCelebration }: CelebrationsViewProps) {
  const { data: celebrations, isLoading } = useCelebrations();

  const celebrationsByType = {
    Eucarística: celebrations?.filter(c => c.feast_type === "Eucarística") || [],
    Mariana: celebrations?.filter(c => c.feast_type === "Mariana") || [],
    Temporal: celebrations?.filter(c => c.feast_type === "Temporal") || [],
    Santos: celebrations?.filter(c => c.feast_type === "Santos") || [],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Celebrações" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-6 lg:space-y-8">
        {/* Tempos Litúrgicos */}
        <section>
          <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
            Tempos Litúrgicos
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide lg:flex-wrap">
            {LITURGICAL_SEASONS.map((season) => (
              <button
                key={season}
                className="px-4 py-3 rounded-xl bg-parchment border border-gold/20 text-sm font-medium whitespace-nowrap hover:border-gold hover:bg-gold/10 transition-all"
              >
                {season}
              </button>
            ))}
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
                Todas as Celebrações
              </h2>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {celebrations?.map((celebration) => (
                  <Card
                    key={celebration.id}
                    variant="interactive"
                    onClick={() => onSelectCelebration?.(celebration.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                celebration.liturgical_rank === "solemnity"
                                  ? "gold"
                                  : celebration.liturgical_rank === "feast"
                                  ? "rose"
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {LITURGICAL_RANK_LABELS[celebration.liturgical_rank]}
                            </Badge>
                            {celebration.feast_type && (
                              <Badge variant="outline" className="text-[10px]">
                                {celebration.feast_type}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-display font-semibold text-base mb-1">
                            {celebration.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {celebration.description}
                          </p>
                          <p className="text-xs text-gold mt-2 font-medium">
                            {celebration.date_rule}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Por Tipo de Festa */}
            <section className="mt-6 lg:mt-0">
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                Por Tipo de Festa
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {[
                  { type: "Eucarística", label: "Eucarísticas", icon: "🍞" },
                  { type: "Mariana", label: "Marianas", icon: "💐" },
                  { type: "Temporal", label: "Temporais", icon: "📅" },
                  { type: "Santos", label: "Santos", icon: "✨" },
                ].map((item) => (
                  <Card key={item.type} variant="interactive">
                    <CardContent className="p-4 flex items-center gap-3 lg:gap-4">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h3 className="font-medium text-sm">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {celebrationsByType[item.type as keyof typeof celebrationsByType].length} celebrações
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
