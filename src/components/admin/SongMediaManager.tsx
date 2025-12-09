import { useState, useRef } from "react";
import { FileAudio, FileText, Upload, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useSongAudioTracks,
  useSongScores,
  useUploadAudio,
  useUploadScore,
  useDeleteAudio,
  useDeleteScore,
  Song,
} from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioConverter } from "@/hooks/useAudioConverter";
import { toast } from "sonner";

interface SongMediaManagerProps {
  song: Song;
}

const voiceLabels: Record<string, string> = {
  soprano: "Soprano",
  contralto: "Contralto",
  tenor: "Tenor",
  baixo: "Baixo",
};

export function SongMediaManager({ song }: SongMediaManagerProps) {
  const { user } = useAuth();
  const { data: audioTracks, isLoading: loadingAudio } = useSongAudioTracks(song.id);
  const { data: scores, isLoading: loadingScores } = useSongScores(song.id);
  
  const uploadAudio = useUploadAudio();
  const uploadScore = useUploadScore();
  const deleteAudio = useDeleteAudio();
  const deleteScore = useDeleteScore();
  
  // Audio converter hook
  const { convertToMp3, isConverting, conversionProgress } = useAudioConverter();

  const [selectedVoice, setSelectedVoice] = useState<string>("soprano");
  const [deleteAudioId, setDeleteAudioId] = useState<string | null>(null);
  const [deleteScoreId, setDeleteScoreId] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const scoreInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',      // MP3
    'audio/x-mpeg',    // MP3 (variante)
    'audio/wav',       // WAV
    'audio/wave',      // WAV
    'audio/x-wav',     // WAV
    'audio/flac',      // FLAC
    'audio/x-flac',    // FLAC (variante)
    'audio/mp4',       // M4A
    'audio/m4a',       // M4A
    'audio/x-m4a',     // M4A (variante iOS)
    'audio/ogg',       // OGG
    'audio/opus',      // OPUS
    'audio/aac',       // AAC
    'audio/x-aac',     // AAC (variante)
    'audio/webm',      // WebM audio
  ];

  const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.opus', '.aac', '.webm'];

  const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB

  const isValidAudioFile = (file: File): boolean => {
    // Verifica por MIME type
    if (ALLOWED_AUDIO_TYPES.includes(file.type)) return true;
    
    // Fallback: verifica por extensão (útil para iOS que pode ter MIME types inconsistentes)
    const fileName = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo (MIME type ou extensão)
    if (!isValidAudioFile(file)) {
      toast.error("Formato não suportado. Use MP3, WAV, FLAC, M4A, OPUS ou OGG.");
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }

    // Validar tamanho
    if (file.size > MAX_AUDIO_SIZE) {
      toast.error("Arquivo muito grande. O limite é 100MB.");
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }

    try {
      // Convert to MP3 for iOS compatibility
      const mp3File = await convertToMp3(file);
      
      await uploadAudio.mutateAsync({
        file: mp3File,
        songId: song.id,
        voicePart: selectedVoice as "soprano" | "contralto" | "tenor" | "baixo",
        uploaderId: user.id,
      });
      toast.success("Áudio enviado com sucesso");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar áudio");
    }
    
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

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

  const handleDeleteAudio = async () => {
    if (!deleteAudioId) return;
    try {
      await deleteAudio.mutateAsync({ id: deleteAudioId, songId: song.id });
      toast.success("Áudio excluído");
      setDeleteAudioId(null);
    } catch (error) {
      toast.error("Erro ao excluir áudio");
    }
  };

  const handleDeleteScore = async () => {
    if (!deleteScoreId) return;
    try {
      await deleteScore.mutateAsync({ id: deleteScoreId, songId: song.id });
      toast.success("Partitura excluída");
      setDeleteScoreId(null);
    } catch (error) {
      toast.error("Erro ao excluir partitura");
    }
  };

  return (
    <div className="space-y-6">
      {/* Audio Tracks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileAudio className="h-4 w-4 text-gold" />
            Áudios de Ensaio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversion Progress */}
          {isConverting && conversionProgress && (
            <div className="space-y-2 p-3 bg-gold/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                <span>{conversionProgress.message}</span>
              </div>
              <Progress value={conversionProgress.progress} className="h-2" />
            </div>
          )}
          
          {/* Upload Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Naipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soprano">Soprano</SelectItem>
                <SelectItem value="contralto">Contralto</SelectItem>
                <SelectItem value="tenor">Tenor</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
              </SelectContent>
            </Select>
            
            <input
              ref={audioInputRef}
              type="file"
              onChange={handleAudioUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => audioInputRef.current?.click()}
              disabled={uploadAudio.isPending || isConverting}
              className="gap-2"
            >
              {(uploadAudio.isPending || isConverting) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isConverting ? "Convertendo..." : uploadAudio.isPending ? "Enviando..." : "Enviar Áudio"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos: MP3, WAV, FLAC, M4A, OPUS, OGG (máx. 100MB)
          </p>

          {/* Audio List */}
          {loadingAudio ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : audioTracks?.length ? (
            <div className="space-y-2">
              {audioTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {track.voice_part ? voiceLabels[track.voice_part] : "Tutti"}
                    </Badge>
                    <audio controls className="h-8 max-w-[200px]">
                      <source src={track.file_url} />
                    </audio>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteAudioId(track.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum áudio cadastrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scores Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-gold" />
            Partituras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              ref={scoreInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleScoreUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => scoreInputRef.current?.click()}
              disabled={uploadScore.isPending}
              className="gap-2"
            >
              {uploadScore.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Enviar Partitura (PDF)
            </Button>
          </div>

          {/* Scores List */}
          {loadingScores ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : scores?.length ? (
            <div className="space-y-2">
              {scores.map((score) => {
                // Exibir nome original do arquivo ou extrair do URL
                const displayName = (score as any).file_name 
                  || score.file_url.split('/').pop()?.replace(/^score_\d+\.pdf$/, `${song.title}.pdf`) 
                  || 'Partitura';
                
                return (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-rose" />
                      <span className="text-sm truncate max-w-[200px]">{displayName}</span>
                      {score.key_signature && (
                        <Badge variant="secondary">{score.key_signature}</Badge>
                      )}
                    </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(score.file_url, "_blank")}
                      title="Abrir PDF"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteScoreId(score.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma partitura cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Audio Confirmation */}
      <AlertDialog open={!!deleteAudioId} onOpenChange={() => setDeleteAudioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir áudio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAudio} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Score Confirmation */}
      <AlertDialog open={!!deleteScoreId} onOpenChange={() => setDeleteScoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir partitura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteScore} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
