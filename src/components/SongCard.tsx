import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, FileText, Headphones, ChevronRight } from "lucide-react";
import { Song, VOICE_PARTS } from "@/lib/data";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  onClick?: () => void;
}

export function SongCard({ song, onClick }: SongCardProps) {
  const availableVoices = VOICE_PARTS.filter(
    (voice) => song.hasAudio[voice.abbreviation.toLowerCase() as keyof typeof song.hasAudio]
  );

  return (
    <Card
      variant="interactive"
      className="group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Título e Compositor */}
            <h3 className="font-display text-base font-semibold text-foreground leading-tight mb-1 truncate">
              {song.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {song.composer}
              {song.arranger && <span className="text-xs"> • {song.arranger}</span>}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant={song.voicingType === "gregorian" ? "gold" : "rose"}>
                {song.voicingType === "gregorian" ? "Gregoriano" : song.texture}
              </Badge>
              {song.liturgicalTags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Recursos Disponíveis */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {song.hasScore && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Partitura</span>
                </div>
              )}
              {song.hasAudio.full && (
                <div className="flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Áudio</span>
                </div>
              )}
              {availableVoices.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    {availableVoices.slice(0, 4).map((voice) => (
                      <span
                        key={voice.id}
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card",
                          voice.color === "rose"
                            ? "bg-rose/20 text-rose"
                            : "bg-gold/20 text-gold-dark"
                        )}
                      >
                        {voice.abbreviation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seta */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-gold/10 transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
