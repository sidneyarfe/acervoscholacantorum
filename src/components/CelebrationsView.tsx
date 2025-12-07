import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { MOCK_CELEBRATIONS, LITURGICAL_SEASONS } from "@/lib/data";

interface CelebrationsViewProps {
  onSelectCelebration?: (celebrationId: string) => void;
}

export function CelebrationsView({ onSelectCelebration }: CelebrationsViewProps) {
  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header title="Celebrações" showLogo={false} />

      <main className="flex-1 px-4 py-4 space-y-6">
        {/* Tempos Litúrgicos */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Tempos Litúrgicos
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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

        {/* Próximas Celebrações */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Próximas Celebrações
          </h2>
          <div className="space-y-3">
            {MOCK_CELEBRATIONS.map((celebration) => (
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
                            celebration.liturgicalRank === "solemnity"
                              ? "gold"
                              : celebration.liturgicalRank === "feast"
                              ? "rose"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {celebration.liturgicalRank === "solemnity"
                            ? "Solenidade"
                            : celebration.liturgicalRank === "feast"
                            ? "Festa"
                            : "Memorial"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {celebration.feastType}
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold text-base mb-1">
                        {celebration.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {celebration.description}
                      </p>
                      <p className="text-xs text-gold mt-2 font-medium">
                        {celebration.dateRule}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Todas as Celebrações por Tipo */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Por Tipo de Festa
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "Eucharistic", label: "Eucarísticas", count: 4, icon: "🍞" },
              { type: "Marian", label: "Marianas", count: 8, icon: "💐" },
              { type: "Temporal", label: "Temporais", count: 12, icon: "📅" },
              { type: "Saints", label: "Santos", count: 20, icon: "✨" },
            ].map((item) => (
              <Card key={item.type} variant="interactive">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <h3 className="font-medium text-sm">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.count} celebrações
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
