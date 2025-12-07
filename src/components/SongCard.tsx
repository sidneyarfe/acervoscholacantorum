import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Headphones, ChevronRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Song = Tables<"songs">;

interface SongCardProps {
  song: Song;
  onClick?: () => void;
  audioVoices?: string[];
}

const VOICING_LABELS: Record<string, string> = {
  polyphonic: "SATB",
  gregorian: "Gregoriano",
  unison: "Uníssono",
};

const VOICE_LABELS: Record<string, string> = {
  soprano: "Soprano",
  contralto: "Contralto",
  tenor: "Tenor",
  baixo: "Baixo",
};

const VOICE_ORDER = ["soprano", "contralto", "tenor", "baixo"];

export function SongCard({ song, onClick, audioVoices = [] }: SongCardProps) {
  const liturgicalTags = Array.isArray(song.liturgical_tags) 
    ? song.liturgical_tags as string[]
    : [];

  // Sort voices in standard order
  const sortedVoices = audioVoices
    .sort((a, b) => VOICE_ORDER.indexOf(a) - VOICE_ORDER.indexOf(b))
    .map(v => VOICE_LABELS[v] || v);

  const audioLabel = sortedVoices.length > 0 
    ? `Áudio: ${sortedVoices.join(", ")}`
    : "Áudio";

  return (
    <Card
      variant="interactive"
      className="group cursor-pointer"
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
              {song.arranger && <span className="text-xs"> • Arr. {song.arranger}</span>}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant={song.voicing_type === "gregorian" ? "gold" : "rose"}>
                {VOICING_LABELS[song.voicing_type] || song.texture}
              </Badge>
              {liturgicalTags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Recursos Disponíveis */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Partitura</span>
              </div>
              <div className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" />
                <span className={sortedVoices.length > 0 ? "text-emerald-600" : ""}>
                  {audioLabel}
                </span>
              </div>
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
