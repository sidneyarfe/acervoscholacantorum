import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Download,
  Clock,
  Music2,
  ChevronRight
} from "lucide-react";
import { Song, VOICE_PARTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SongDetailProps {
  song: Song;
  onBack: () => void;
}

export function SongDetail({ song, onBack }: SongDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const [mutedVoices, setMutedVoices] = useState<string[]>([]);

  const availableVoices = VOICE_PARTS.filter(
    (voice) => song.hasAudio[voice.abbreviation.toLowerCase() as keyof typeof song.hasAudio]
  );

  const toggleMute = (voiceId: string) => {
    setMutedVoices((prev) =>
      prev.includes(voiceId)
        ? prev.filter((v) => v !== voiceId)
        : [...prev, voiceId]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-semibold text-foreground truncate">
              {song.title}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{song.composer}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Card de Informações */}
        <Card variant="sacred">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={song.voicingType === "gregorian" ? "gold" : "rose"}>
                {song.voicingType === "gregorian" ? "Gregoriano" : song.texture}
              </Badge>
              <Badge variant="outline">{song.language}</Badge>
              <Badge variant="outline">{song.genre}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              {song.arranger && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arranjo:</span>
                  <span className="font-medium">{song.arranger}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Celebrações:</span>
                <span className="font-medium">{song.celebrations.join(", ")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Partitura */}
        {song.hasScore && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Partitura
            </h2>
            <Card variant="interactive">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{song.title}.pdf</p>
                    <p className="text-xs text-muted-foreground">4 páginas • PDF</p>
                  </div>
                </div>
                <Button variant="gold" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Baixar
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Seção do Player de Áudio */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Music2 className="w-5 h-5 text-gold" />
            Áudios de Ensaio
          </h2>

          {/* Gravação Completa */}
          {song.hasAudio.full && (
            <Card variant="gold" className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Gravação Completa</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>3:45</span>
                  </div>
                </div>

                {/* Placeholder da Forma de Onda */}
                <div className="h-12 bg-gold/10 rounded-lg mb-3 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-8">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gold/40 rounded-full animate-pulse"
                        style={{
                          height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <span className="text-xs font-mono">0.75x</span>
                  </Button>
                  <Button
                    variant="gold"
                    size="icon"
                    className="w-14 h-14 rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <span className="text-xs font-mono">1.25x</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Naipes */}
          {availableVoices.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Naipes individuais</p>
              <div className="grid grid-cols-2 gap-3">
                {availableVoices.map((voice) => {
                  const isMuted = mutedVoices.includes(voice.id);
                  const isHighVoice = voice.abbreviation === "S" || voice.abbreviation === "A";

                  return (
                    <Card
                      key={voice.id}
                      variant="interactive"
                      className={cn(
                        "border-2",
                        activeVoice === voice.id
                          ? isHighVoice
                            ? "border-rose"
                            : "border-gold"
                          : "border-transparent"
                      )}
                      onClick={() => setActiveVoice(voice.id)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              isHighVoice
                                ? "bg-rose/20 text-rose"
                                : "bg-gold/20 text-gold-dark"
                            )}
                          >
                            {voice.abbreviation}
                          </div>
                          <span className="text-sm font-medium">{voice.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute(voice.id);
                          }}
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Celebrações */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Celebrações</h2>
          <div className="space-y-2">
            {song.celebrations.map((celebration) => (
              <Card key={celebration} variant="interactive">
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{celebration}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
