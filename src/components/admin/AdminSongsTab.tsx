import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Music, FileAudio, FileText, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAdminSongs, useDeleteSong, Song } from "@/hooks/useAdminData";
import { SongForm } from "./SongForm";
import { SongMediaManager } from "./SongMediaManager";
import { toast } from "sonner";

export function AdminSongsTab() {
  const { data: songs, isLoading } = useAdminSongs();
  const deleteSong = useDeleteSong();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [mediaManagerSong, setMediaManagerSong] = useState<Song | null>(null);
  const [deleteConfirmSong, setDeleteConfirmSong] = useState<Song | null>(null);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    if (!searchQuery.trim()) return songs;
    
    const query = searchQuery.toLowerCase();
    return songs.filter((song) =>
      song.title.toLowerCase().includes(query) ||
      song.composer?.toLowerCase().includes(query) ||
      song.arranger?.toLowerCase().includes(query) ||
      song.language?.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmSong) return;
    try {
      await deleteSong.mutateAsync(deleteConfirmSong.id);
      toast.success("Música excluída com sucesso");
      setDeleteConfirmSong(null);
    } catch (error) {
      toast.error("Erro ao excluir música");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSong(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-gold" />
            Músicas ({songs?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar músicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Música</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Compositor</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden lg:table-cell">Idioma</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {song.composer || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {song.voicing_type === 'polyphonic' ? 'Polifônico' : 
                         song.voicing_type === 'gregorian' ? 'Gregoriano' : 
                         song.voicing_type === 'unison' ? 'Uníssono' : song.voicing_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {song.language || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMediaManagerSong(song)}
                          title="Gerenciar mídia"
                        >
                          <FileAudio className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(song)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmSong(song)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredSongs.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "Nenhuma música encontrada" : "Nenhuma música cadastrada"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Song Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSong ? "Editar Música" : "Nova Música"}
            </DialogTitle>
          </DialogHeader>
          <SongForm song={editingSong} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      {/* Media Manager Dialog */}
      <Dialog open={!!mediaManagerSong} onOpenChange={() => setMediaManagerSong(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              Mídia: {mediaManagerSong?.title}
            </DialogTitle>
          </DialogHeader>
          {mediaManagerSong && <SongMediaManager song={mediaManagerSong} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmSong} onOpenChange={() => setDeleteConfirmSong(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir música?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConfirmSong?.title}"? 
              Esta ação não pode ser desfeita e removerá todos os áudios e partituras associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
