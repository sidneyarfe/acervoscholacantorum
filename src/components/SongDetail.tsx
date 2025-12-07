import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Play, 
  Pause, 
  Download,
  Clock,
  Music2
} from "lucide-react";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Song = Tables<"songs">;

interface SongDetailProps {
  song: Song;
  onBack: () => void;
}

const VOICING_LABELS: Record<string, string> = {
  polyphonic: "SATB",
  gregorian: "Gregoriano",
  unison: "Uníssono",
};

export function SongDetail({ song, onBack }: SongDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const liturgicalTags = Array.isArray(song.liturgical_tags) 
    ? song.liturgical_tags as string[]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 lg:pb-0">
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

      <main className="flex-1 p-4 lg:p-8 space-y-6 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Card de Informações */}
        <Card variant="sacred">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-8 h-8 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-semibold">
                  {song.title}
                </h2>
                <p className="text-muted-foreground">
                  {song.composer}
                  {song.arranger && ` • Arr. ${song.arranger}`}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="gold">
                    {VOICING_LABELS[song.voicing_type] || song.texture}
                  </Badge>
                  <Badge variant="outline">{song.language || "Latim"}</Badge>
                  <Badge variant="outline">{song.genre || "Sacra"}</Badge>
                </div>
              </div>
            </div>

            {liturgicalTags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {liturgicalTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seleção de Naipe */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Selecione seu Naipe
          </h2>
          <VoicePartSelector
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
          />
        </section>

        {/* Seção do Player de Áudio */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Music2 className="w-5 h-5 text-gold" />
            Áudios de Ensaio
          </h2>

          <Card variant="gold">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">
                  {selectedVoice 
                    ? `Naipe: ${selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}`
                    : "Gravação Completa"
                  }
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>--:--</span>
                </div>
              </div>

              {/* Placeholder da Forma de Onda */}
              <div className="h-12 bg-gold/10 rounded-lg mb-3 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum áudio disponível
                </p>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" disabled>
                  <span className="text-xs font-mono">0.75x</span>
                </Button>
                <Button
                  variant="gold"
                  size="icon"
                  className="w-14 h-14 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" disabled>
                  <span className="text-xs font-mono">1.25x</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Seção de Partitura */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose" />
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
                  <p className="text-xs text-muted-foreground">Não disponível</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-1" />
                Baixar
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Metadados */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Informações
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Gênero</p>
                <p className="font-medium">{song.genre || "Sacra"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Idioma</p>
                <p className="font-medium">{song.language || "Latim"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{VOICING_LABELS[song.voicing_type]}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{VOICING_LABELS[song.voicing_type]}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
