import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Music2, Calendar, Clock, ChevronRight, BookOpen, Headphones, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { SongCard } from "@/components/SongCard";
import { useSongs } from "@/hooks/useSongs";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-sacred.jpg";

interface HomeViewProps {
  selectedVoice: string | null;
  onSelectVoice: (voiceId: string) => void;
  onNavigate: (tab: string) => void;
  onSelectSong: (songId: string) => void;
}

const LITURGICAL_RANK_LABELS: Record<string, string> = {
  solemnity: "SOLENIDADE",
  feast: "FESTA",
  memorial: "MEMORIAL",
  optional_memorial: "MEMORIAL OPCIONAL",
};

export function HomeView({ selectedVoice, onSelectVoice, onNavigate, onSelectSong }: HomeViewProps) {
  const { data: songs, isLoading: loadingSongs } = useSongs();
  const { data: celebrations, isLoading: loadingCelebrations } = useCelebrations();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  const recentSongs = songs?.slice(0, 4) || [];
  const upcomingCelebrations = celebrations?.slice(0, 2) || [];

  // Apenas seleção local para navegação - não salva no perfil
  // Naipe no perfil só pode ser alterado pelo admin
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
        {/* Seção Hero */}
        <section className="relative h-44 lg:h-56 overflow-hidden">
          <img
            src={heroImage}
            alt="Manuscrito de música sacra"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8">
            <p className="text-xs lg:text-sm uppercase tracking-wider text-gold font-medium mb-1">Desde 1735</p>
            <h2 className="font-display text-xl lg:text-3xl font-semibold text-foreground">
              Bem vindo ao nosso Acervo Musical Digital!
            </h2>
          </div>
        </section>

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
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg lg:text-xl font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold" />
                    Músicas do Acervo
                  </h2>
                  <Button variant="ghost" size="sm" className="text-gold" onClick={() => onNavigate("library")}>
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {loadingSongs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gold" />
                  </div>
                ) : (
                  <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                    {recentSongs.map((song) => (
                      <SongCard key={song.id} song={song} onClick={() => onSelectSong(song.id)} />
                    ))}
                  </div>
                )}
              </section>
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
                      <Card key={celebration.id} variant="interactive">
                        <CardContent className="p-4">
                          <Badge variant="liturgical" className="mb-2 text-[10px]">
                            {LITURGICAL_RANK_LABELS[celebration.liturgical_rank]}
                          </Badge>
                          <h3 className="font-display font-semibold text-base">{celebration.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{celebration.description}</p>
                          <p className="text-xs text-gold mt-2">{celebration.date_rule}</p>
                        </CardContent>
                      </Card>
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
                      <p className="text-xl font-display font-bold text-foreground">0</p>
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
                  <Card key={celebration.id} variant="interactive">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="liturgical" className="mb-2 text-[10px]">
                            {LITURGICAL_RANK_LABELS[celebration.liturgical_rank]}
                          </Badge>
                          <h3 className="font-display font-semibold text-base">{celebration.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{celebration.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{celebration.date_rule}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                <p className="text-2xl font-display font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Áudios</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
