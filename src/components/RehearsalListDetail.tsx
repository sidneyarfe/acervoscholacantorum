import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ArrowLeft,
  Calendar,
  Music,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Pencil,
  Save,
  X,
  MessageSquare,
} from "lucide-react";
import {
  useRehearsalList,
  useRehearsalListSongs,
  useUpdateRehearsalList,
  useAddSongToRehearsalList,
  useRemoveSongFromRehearsalList,
  useUpdateRehearsalListSong,
} from "@/hooks/useRehearsalLists";
import { useSongs } from "@/hooks/useSongs";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RehearsalListDetailProps {
  listId: string;
  onBack: () => void;
  onSelectSong: (songId: string) => void;
}

export function RehearsalListDetail({ listId, onBack, onSelectSong }: RehearsalListDetailProps) {
  const { isAdmin } = useIsAdmin();
  const { data: list, isLoading: loadingList } = useRehearsalList(listId);
  const { data: listSongs, isLoading: loadingSongs } = useRehearsalListSongs(listId);
  const { data: allSongs } = useSongs();
  const updateList = useUpdateRehearsalList();
  const addSong = useAddSongToRehearsalList();
  const removeSong = useRemoveSongFromRehearsalList();
  const updateSongNotes = useUpdateRehearsalListSong();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    date: "",
  });

  // Filter available songs (not already in list)
  const availableSongs = allSongs?.filter(
    (song) => !listSongs?.some((ls) => ls.song_id === song.id)
  ) || [];

  const handleStartEdit = () => {
    if (list) {
      setEditForm({
        name: list.name,
        description: list.description || "",
        date: list.date || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateList.mutateAsync({
        id: listId,
        name: editForm.name,
        description: editForm.description || null,
        date: editForm.date || null,
      });
      toast.success("Lista atualizada");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar lista");
    }
  };

  const handleAddSong = async (songId: string) => {
    try {
      await addSong.mutateAsync({ listId, songId });
      toast.success("Música adicionada");
      setIsAddingSong(false);
    } catch (error) {
      toast.error("Erro ao adicionar música");
    }
  };

  const handleRemoveSong = async () => {
    if (!deleteItemId) return;
    try {
      await removeSong.mutateAsync({ id: deleteItemId, listId });
      toast.success("Música removida");
      setDeleteItemId(null);
    } catch (error) {
      toast.error("Erro ao remover música");
    }
  };

  const handleStartEditNote = (itemId: string, currentNote: string | null) => {
    setEditingNoteId(itemId);
    setNoteText(currentNote || "");
  };

  const handleSaveNote = async (itemId: string) => {
    try {
      await updateSongNotes.mutateAsync({
        id: itemId,
        listId,
        notes: noteText,
      });
      toast.success("Nota salva");
      setEditingNoteId(null);
    } catch (error) {
      toast.error("Erro ao salvar nota");
    }
  };

  if (loadingList) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Lista não encontrada</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-display font-bold"
                />
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} disabled={updateList.isPending}>
                    {updateList.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {list.name}
                  </h1>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={handleStartEdit}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {list.date && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(list.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                )}
                {list.description && (
                  <p className="text-muted-foreground mt-2">{list.description}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Song Button */}
        {isAdmin && (
          <Button onClick={() => setIsAddingSong(true)} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Música
          </Button>
        )}

        {/* Songs List */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Music className="h-5 w-5 text-gold" />
            Músicas ({listSongs?.length || 0})
          </h2>

          {loadingSongs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : listSongs?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Music className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma música adicionada ainda
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {listSongs?.map((item, index) => (
                <Card key={item.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <button
                          className="text-left w-full"
                          onClick={() => item.song && onSelectSong(item.song.id)}
                        >
                          <h4 className="font-medium hover:text-gold transition-colors">
                            {item.song?.title}
                          </h4>
                          {item.song?.composer && (
                            <p className="text-sm text-muted-foreground">{item.song.composer}</p>
                          )}
                        </button>

                        {/* Notes */}
                        {editingNoteId === item.id ? (
                          <div className="mt-2 flex gap-2">
                            <Input
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Adicionar nota..."
                              className="text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleSaveNote(item.id)}
                              disabled={updateSongNotes.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingNoteId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : item.notes ? (
                          <div
                            className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1 cursor-pointer hover:bg-muted"
                            onClick={() => isAdmin && handleStartEditNote(item.id, item.notes)}
                          >
                            <MessageSquare className="h-3 w-3 inline mr-1" />
                            {item.notes}
                          </div>
                        ) : isAdmin ? (
                          <button
                            className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            onClick={() => handleStartEditNote(item.id, null)}
                          >
                            <Plus className="h-3 w-3" />
                            Adicionar nota
                          </button>
                        ) : null}
                      </div>

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeleteItemId(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Song Dialog */}
      <Dialog open={isAddingSong} onOpenChange={setIsAddingSong}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Adicionar Música</DialogTitle>
          </DialogHeader>
          <Command className="rounded-lg border">
            <CommandInput placeholder="Buscar música..." />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>Nenhuma música encontrada</CommandEmpty>
              <CommandGroup>
                {availableSongs.map((song) => (
                  <CommandItem
                    key={song.id}
                    value={song.title}
                    onSelect={() => handleAddSong(song.id)}
                    className="cursor-pointer"
                  >
                    <Music className="h-4 w-4 mr-2 text-gold" />
                    <div>
                      <p className="font-medium">{song.title}</p>
                      {song.composer && (
                        <p className="text-sm text-muted-foreground">{song.composer}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover música da lista?</AlertDialogTitle>
            <AlertDialogDescription>
              A música será removida desta lista de ensaio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveSong}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
