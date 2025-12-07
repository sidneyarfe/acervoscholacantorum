import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Music2,
  ExternalLink,
  Upload,
  Loader2
} from "lucide-react";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useState, useMemo, useRef } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { useSongAudioTracks, useSongScores, useUploadScore } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

const VOICE_LABELS: Record<string, string> = {
  soprano: "Soprano",
  contralto: "Contralto",
  tenor: "Tenor",
  baixo: "Baixo",
};

export function SongDetail({ song, onBack }: SongDetailProps) {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const uploadScore = useUploadScore();
  const scoreInputRef = useRef<HTMLInputElement>(null);
  
  const { data: audioTracks, isLoading: loadingAudio } = useSongAudioTracks(song.id);
  const { data: scores, isLoading: loadingScores } = useSongScores(song.id);

  const liturgicalTags = Array.isArray(song.liturgical_tags) 
    ? song.liturgical_tags as string[]
    : [];

  // Find the appropriate audio track based on selected voice
  const currentAudioTrack = useMemo(() => {
    if (!audioTracks?.length) return null;
    
    if (selectedVoice) {
      // Only return the track if it matches the selected voice
      return audioTracks.find(t => t.voice_part === selectedVoice) || null;
    }
    
    // No voice selected, show first available track
    return audioTracks[0];
  }, [audioTracks, selectedVoice]);

  // Label based on selected voice (not the track, since track might be null)
  const currentVoiceLabel = selectedVoice 
    ? VOICE_LABELS[selectedVoice] 
    : (currentAudioTrack?.voice_part ? VOICE_LABELS[currentAudioTrack.voice_part] : "Gravação Completa");

  const latestScore = scores?.[0];

  const handleScoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos");
      return;
    }

    try {
      await uploadScore.mutateAsync({
        file,
        songId: song.id,
        uploaderId: user.id,
      });
      toast.success("Partitura enviada com sucesso");
    } catch (error) {
      toast.error("Erro ao enviar partitura");
    }

    if (scoreInputRef.current) {
      scoreInputRef.current.value = "";
    }
  };

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
              {loadingAudio ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-14 w-14 rounded-full mx-auto" />
                </div>
              ) : (
                <AudioPlayer
                  audioUrl={currentAudioTrack?.file_url || null}
                  voiceLabel={currentVoiceLabel}
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Seção de Partitura */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose" />
              Partitura
            </h2>
            {isAdmin && (
              <>
                <input
                  ref={scoreInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleScoreUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scoreInputRef.current?.click()}
                  disabled={uploadScore.isPending}
                  className="gap-2"
                >
                  {uploadScore.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Enviar PDF
                </Button>
              </>
            )}
          </div>
          <Card variant="interactive">
            <CardContent className="p-4 flex items-center justify-between">
              {loadingScores ? (
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-12 h-16 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ) : latestScore ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg bg-rose/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-rose" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{song.title}.pdf</p>
                      <p className="text-xs text-muted-foreground">
                        {latestScore.key_signature || "Partitura disponível"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(latestScore.file_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = latestScore.file_url;
                        link.download = `${song.title}.pdf`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Metadados - Apenas informações adicionais não exibidas acima */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Informações
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Compositor</p>
                <p className="font-medium">{song.composer || "—"}</p>
              </CardContent>
            </Card>
            {song.arranger && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Arranjo</p>
                  <p className="font-medium">{song.arranger}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Tipo de Vozes</p>
                <p className="font-medium">{VOICING_LABELS[song.voicing_type]}</p>
              </CardContent>
            </Card>
            {song.texture && song.texture !== VOICING_LABELS[song.voicing_type] && (
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Textura</p>
                  <p className="font-medium">{song.texture}</p>
                </CardContent>
              </Card>
            )}
            {song.copyright_info && (
              <Card className="col-span-2">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Copyright</p>
                  <p className="font-medium text-sm">{song.copyright_info}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
