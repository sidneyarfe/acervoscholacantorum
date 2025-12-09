import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CelebrationCard } from "@/components/CelebrationCard";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useCelebrationTypes } from "@/hooks/useSongOptions";

interface CelebrationsViewProps {
  onSelectCelebration?: (celebrationId: string) => void;
}

export function CelebrationsView({ onSelectCelebration }: CelebrationsViewProps) {
  const { data: celebrations, isLoading } = useCelebrations();
  const { data: celebrationTypes = [] } = useCelebrationTypes();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Group celebrations by type
  const celebrationsByType = celebrationTypes.reduce((acc, type) => {
    acc[type.name] = celebrations?.filter(c => c.feast_type === type.name) || [];
    return acc;
  }, {} as Record<string, typeof celebrations>);

  // Filter celebrations when a type is selected
  const displayedCelebrations = selectedType
    ? celebrations?.filter(c => c.feast_type === selectedType) || []
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Celebrações" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-6 lg:space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : selectedType ? (
          /* Filtered View */
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg lg:text-xl font-semibold">
                {selectedType}
              </h2>
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-gold hover:underline"
              >
                Ver todos os tipos
              </button>
            </div>
            <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
              {displayedCelebrations?.map((celebration) => (
                <CelebrationCard
                  key={celebration.id}
                  celebration={celebration}
                  onClick={() => onSelectCelebration?.(celebration.id)}
                />
              ))}
              {displayedCelebrations?.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhuma celebração encontrada</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Type Selection View */
          <section>
            <h2 className="font-display text-lg lg:text-xl font-semibold mb-4">
              Por Tipo de Celebração
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {celebrationTypes.map((type) => (
                <Card 
                  key={type.id} 
                  variant="interactive"
                  onClick={() => setSelectedType(type.name)}
                  className="cursor-pointer"
                >
                  <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                      <span className="text-2xl">⛪</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {celebrationsByType[type.name]?.length || 0} celebrações
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {celebrationTypes.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhum tipo de celebração cadastrado</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
