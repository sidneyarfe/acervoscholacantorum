import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Music2, Calendar, Clock, ChevronRight, BookOpen, Headphones, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { CelebrationCard } from "@/components/CelebrationCard";
import { BannerCarousel } from "@/components/BannerCarousel";
import { RecentSongs } from "@/components/RecentSongs";
import { useSongs } from "@/hooks/useSongs";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useProfile } from "@/hooks/useProfile";
import { useAudioCount } from "@/hooks/useAudioCount";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useToast } from "@/hooks/use-toast";

interface HomeViewProps {
  selectedVoice: string | null;
  onSelectVoice: (voiceId: string) => void;
  onNavigate: (tab: string) => void;
  onSelectSong: (songId: string) => void;
  onSelectCelebration: (celebrationId: string) => void;
}

export function HomeView({ selectedVoice, onSelectVoice, onNavigate, onSelectSong, onSelectCelebration }: HomeViewProps) {
  const { data: songs, isLoading: loadingSongs } = useSongs();
  const { data: celebrations, isLoading: loadingCelebrations } = useCelebrations();
  const { data: profile } = useProfile();
  const { data: audioCount } = useAudioCount();
  const { recentSearches, removeSearch, clearSearches } = useRecentSearches();
  const { toast } = useToast();

  const upcomingCelebrations = celebrations?.slice(0, 2) || [];

  const handleVoiceSelect = (voiceId: string) => {
    onSelectVoice(voiceId);
    toast({
      title: "Naipe selecionado",
      description: `Áudios de ${voiceId === 'soprano' ? 'Soprano' : voiceId === 'contralto' ? 'Contralto' : voiceId === 'tenor' ? 'Tenor' : 'Baixo'} serão priorizados.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1">
        {/* Banner Carousel */}
        <BannerCarousel />

        <div className="px-4 lg:px-8 py-6 lg:py-8 space-y-8">
          {/* Ações Rápidas - ocultar em desktop pois já tem a sidebar */}
          <section className="lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              <Card variant="interactive" className="cursor-pointer" onClick={() => onNavigate("search")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Buscar</p>
                    <p className="text-xs text-muted-foreground">Músicas</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="interactive" className="cursor-pointer" onClick={() => onNavigate("library")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-rose" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Repertório</p>
                    <p className="text-xs text-muted-foreground">Completo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Layout Desktop: Grid com duas colunas */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Seleção de Naipe */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg lg:text-xl font-semibold">Meu Naipe</h2>
                {(selectedVoice || profile?.preferred_voice) && (
                    <Badge variant="gold" className="text-xs">
                      Selecionado
                    </Badge>
                  )}
                </div>
                <VoicePartSelector 
                  selectedVoice={selectedVoice || profile?.preferred_voice || null} 
                  onSelectVoice={handleVoiceSelect} 
                />
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Selecione seu naipe para acesso rápido aos áudios
                </p>
              </section>

              {/* Músicas Recentes */}
              <RecentSongs
                recentSearches={recentSearches}
                onSelectSong={onSelectSong}
                onRemove={removeSearch}
                onClear={clearSearches}
                showEmpty={true}
              />
            </div>

            {/* Coluna Lateral - Desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Próximas Celebrações */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose" />
                    Próximas Celebrações
                  </h2>
                </div>
                {loadingCelebrations ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-rose" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingCelebrations.map((celebration) => (
                      <CelebrationCard
                        key={celebration.id}
                        celebration={celebration}
                        onClick={() => onSelectCelebration(celebration.id)}
                        showArrow={false}
                      />
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose w-full mt-3"
                  onClick={() => onNavigate("calendar")}
                >
                  Ver todas as celebrações
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </section>

              {/* Estatísticas Desktop */}
              <section className="bg-parchment rounded-2xl p-5">
                <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4">Nosso Acervo</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/10">
                      <Music2 className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-foreground">{songs?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Músicas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose/10">
                      <Calendar className="w-5 h-5 text-rose" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-foreground">{celebrations?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Celebrações</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/10">
                      <Headphones className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-foreground">{audioCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Áudios</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Mobile: Próximas Celebrações */}
          <section className="lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose" />
                Próximas Celebrações
              </h2>
              <Button variant="ghost" size="sm" className="text-rose" onClick={() => onNavigate("calendar")}>
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {loadingCelebrations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-rose" />
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingCelebrations.map((celebration) => (
                  <CelebrationCard
                    key={celebration.id}
                    celebration={celebration}
                    onClick={() => onSelectCelebration(celebration.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Mobile: Estatísticas */}
          <section className="bg-parchment rounded-2xl p-4 lg:hidden">
            <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Nosso Acervo</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-gold/10 mb-2">
                  <Music2 className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{songs?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Músicas</p>
              </div>
              <div>
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-rose/10 mb-2">
                  <Calendar className="w-5 h-5 text-rose" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{celebrations?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Celebrações</p>
              </div>
              <div>
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-gold/10 mb-2">
                  <Headphones className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{audioCount || 0}</p>
                <p className="text-xs text-muted-foreground">Áudios</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
