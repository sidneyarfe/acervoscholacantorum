import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Music2, 
  Calendar, 
  Clock, 
  ChevronRight,
  BookOpen,
  Headphones
} from "lucide-react";
import { Header } from "@/components/Header";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { SongCard } from "@/components/SongCard";
import { MOCK_SONGS, MOCK_CELEBRATIONS } from "@/lib/data";
import heroImage from "@/assets/hero-sacred.jpg";

interface HomeViewProps {
  onSelectVoice: (voiceId: string) => void;
  onNavigate: (tab: string) => void;
  onSelectSong: (songId: string) => void;
}

export function HomeView({ onSelectVoice, onNavigate, onSelectSong }: HomeViewProps) {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const recentSongs = MOCK_SONGS.slice(0, 3);
  const upcomingCelebrations = MOCK_CELEBRATIONS.slice(0, 2);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    onSelectVoice(voiceId);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-44 overflow-hidden">
          <img
            src={heroImage}
            alt="Sacred music manuscript"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs uppercase tracking-wider text-gold font-medium mb-1">
              Desde 1735
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Arquivo Musical Digital
            </h2>
          </div>
        </section>

        <div className="px-4 py-6 space-y-8">
          {/* Quick Actions */}
          <section>
            <div className="grid grid-cols-2 gap-3">
              <Card
                variant="interactive"
                className="cursor-pointer"
                onClick={() => onNavigate("search")}
              >
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

              <Card
                variant="interactive"
                className="cursor-pointer"
                onClick={() => onNavigate("library")}
              >
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

          {/* Voice Part Selection */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Meu Naipe</h2>
              {selectedVoice && (
                <Badge variant="gold" className="text-xs">
                  Selecionado
                </Badge>
              )}
            </div>
            <VoicePartSelector
              selectedVoice={selectedVoice}
              onSelectVoice={handleVoiceSelect}
            />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Selecione seu naipe para acesso rápido aos áudios
            </p>
          </section>

          {/* Recent Songs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                Acessados Recentemente
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold"
                onClick={() => onNavigate("library")}
              >
                Ver todos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onClick={() => onSelectSong(song.id)}
                />
              ))}
            </div>
          </section>

          {/* Upcoming Celebrations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose" />
                Próximas Celebrações
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose"
                onClick={() => onNavigate("calendar")}
              >
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingCelebrations.map((celebration) => (
                <Card key={celebration.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge
                          variant="liturgical"
                          className="mb-2 text-[10px]"
                        >
                          {celebration.liturgicalRank.toUpperCase()}
                        </Badge>
                        <h3 className="font-display font-semibold text-base">
                          {celebration.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {celebration.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {celebration.dateRule}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="bg-parchment rounded-2xl p-4">
            <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">
              Nosso Acervo
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-gold/10 mb-2">
                  <Music2 className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {MOCK_SONGS.length}
                </p>
                <p className="text-xs text-muted-foreground">Músicas</p>
              </div>
              <div>
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-rose/10 mb-2">
                  <Calendar className="w-5 h-5 text-rose" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {MOCK_CELEBRATIONS.length}
                </p>
                <p className="text-xs text-muted-foreground">Celebrações</p>
              </div>
              <div>
                <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-gold/10 mb-2">
                  <Headphones className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">24</p>
                <p className="text-xs text-muted-foreground">Áudios</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
