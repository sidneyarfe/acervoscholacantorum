import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { ArrowLeft, Loader2, Plus, Music2, Trash2 } from "lucide-react";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useSongs } from "@/hooks/useSongs";
import { 
  useCelebrationSongs, 
  useLinkSongToCelebration, 
  useUnlinkSongFromCelebration 
} from "@/hooks/useSongCelebrations";
import { useIsAdmin } from "@/hooks/useUserRole";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LITURGICAL_RANK_LABELS: Record<string, string> = {
  solemnity: "Solenidade",
  feast: "Festa",
  memorial: "Memorial",
  optional_memorial: "Memorial Opcional",
};

interface CelebrationDetailProps {
  celebrationId: string;
  onBack: () => void;
  onSelectSong: (songId: string) => void;
}

export function CelebrationDetail({ celebrationId, onBack, onSelectSong }: CelebrationDetailProps) {
  const { isAdmin } = useIsAdmin();
  const { data: celebrations } = useCelebrations();
  const { data: allSongs } = useSongs();
  const { data: celebrationSongs, isLoading } = useCelebrationSongs(celebrationId);
  const linkSong = useLinkSongToCelebration();
  const unlinkSong = useUnlinkSongFromCelebration();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("");
  const [contextNotes, setContextNotes] = useState("");

  const celebration = celebrations?.find(c => c.id === celebrationId);

  // Filter out songs already linked
  const linkedSongIds = celebrationSongs?.map(cs => cs.song?.id) || [];
  const availableSongs = allSongs?.filter(s => !linkedSongIds.includes(s.id)) || [];

  const handleLinkSong = async () => {
    if (!selectedSongId) return;
    try {
      await linkSong.mutateAsync({
        songId: selectedSongId,
        celebrationId,
        contextNotes: contextNotes || undefined,
        defaultOrder: (celebrationSongs?.length || 0) + 1,
      });
      toast.success("Música vinculada à celebração");
      setDialogOpen(false);
      setSelectedSongId("");
      setContextNotes("");
    } catch {
      toast.error("Erro ao vincular música");
    }
  };

  const handleUnlinkSong = async (linkId: string, songId: string) => {
    try {
      await unlinkSong.mutateAsync({ id: linkId, songId, celebrationId });
      toast.success("Música removida da celebração");
    } catch {
      toast.error("Erro ao remover música");
    }
  };

  if (!celebration) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Celebração" showLogo={false} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title={celebration.name} showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Celebration Info */}
        <Card variant="gold">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      celebration.liturgical_rank === "solemnity"
                        ? "gold"
                        : celebration.liturgical_rank === "feast"
                        ? "rose"
                        : "outline"
                    }
                  >
                    {LITURGICAL_RANK_LABELS[celebration.liturgical_rank]}
                  </Badge>
                  {celebration.feast_type && (
                    <Badge variant="outline">{celebration.feast_type}</Badge>
                  )}
                </div>
                <h1 className="font-display text-xl lg:text-2xl font-semibold">
                  {celebration.name}
                </h1>
                {celebration.description && (
                  <p className="text-muted-foreground mt-2">{celebration.description}</p>
                )}
                {celebration.date_rule && (
                  <p className="text-sm text-gold mt-2">{celebration.date_rule}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Songs Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg lg:text-xl font-semibold flex items-center gap-2">
              <Music2 className="h-5 w-5 text-gold" />
              Músicas desta Celebração
            </h2>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Vincular Música
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Vincular Música à Celebração</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Música</Label>
                      <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma música" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSongs.map(song => (
                            <SelectItem key={song.id} value={song.id}>
                              {song.title} {song.composer && `- ${song.composer}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Contexto (opcional)</Label>
                      <Input
                        placeholder="Ex: Entrada, Comunhão, Ofertório..."
                        value={contextNotes}
                        onChange={(e) => setContextNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleLinkSong} 
                        disabled={!selectedSongId || linkSong.isPending}
                      >
                        {linkSong.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Vincular
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : celebrationSongs && celebrationSongs.length > 0 ? (
            <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
              {celebrationSongs.map((cs) => (
                <div key={cs.id} className="relative group">
                  {cs.song && (
                    <Card 
                      variant="interactive"
                      className="cursor-pointer"
                      onClick={() => onSelectSong(cs.song!.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {cs.context_notes && (
                              <Badge variant="outline" className="mb-2 text-[10px]">
                                {cs.context_notes}
                              </Badge>
                            )}
                            <h3 className="font-display font-semibold text-base">
                              {cs.song.title}
                            </h3>
                            {cs.song.composer && (
                              <p className="text-sm text-muted-foreground">
                                {cs.song.composer}
                              </p>
                            )}
                          </div>
                          {isAdmin && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkSong(cs.id, cs.song!.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Music2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma música vinculada a esta celebração
                </p>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Vincular primeira música
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
