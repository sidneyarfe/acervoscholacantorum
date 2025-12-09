import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  ListMusic, 
  Plus, 
  Calendar, 
  Music, 
  ChevronRight, 
  Loader2,
  Trash2,
  Pencil,
  Search
} from "lucide-react";
import { useRehearsalLists, useCreateRehearsalList, useDeleteRehearsalList } from "@/hooks/useRehearsalLists";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RehearsalListsViewProps {
  onSelectList: (listId: string) => void;
}

export function RehearsalListsView({ onSelectList }: RehearsalListsViewProps) {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { data: lists, isLoading } = useRehearsalLists();
  const createList = useCreateRehearsalList();
  const deleteList = useDeleteRehearsalList();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newList, setNewList] = useState({
    name: "",
    description: "",
    date: "",
  });

  const handleCreate = async () => {
    if (!newList.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      await createList.mutateAsync({
        name: newList.name,
        description: newList.description || null,
        date: newList.date || null,
        created_by: user?.id,
      });
      toast.success("Lista criada com sucesso");
      setIsDialogOpen(false);
      setNewList({ name: "", description: "", date: "" });
    } catch (error) {
      toast.error("Erro ao criar lista");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteList.mutateAsync(deleteId);
      toast.success("Lista excluída com sucesso");
      setDeleteId(null);
    } catch (error) {
      toast.error("Erro ao excluir lista");
    }
  };

  const filteredLists = lists?.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-xl">
              <ListMusic className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Listas de Ensaio
              </h1>
              <p className="text-sm text-muted-foreground">
                Organize as músicas para os ensaios
              </p>
            </div>
          </div>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Lista</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Lista de Ensaio</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Nome *</label>
                    <Input
                      placeholder="Ex: Ensaio de Natal"
                      value={newList.name}
                      onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data do Ensaio</label>
                    <Input
                      type="date"
                      value={newList.date}
                      onChange={(e) => setNewList({ ...newList, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      placeholder="Observações sobre o ensaio..."
                      value={newList.description}
                      onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={createList.isPending}>
                      {createList.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar Lista
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar listas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lists */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : filteredLists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                {searchQuery ? "Nenhuma lista encontrada" : "Nenhuma lista ainda"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery 
                  ? "Tente buscar com outros termos"
                  : isAdmin
                    ? "Crie uma nova lista para organizar as músicas do ensaio"
                    : "As listas de ensaio aparecerão aqui"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLists.map((list) => (
              <Card
                key={list.id}
                variant="interactive"
                className="cursor-pointer group"
                onClick={() => onSelectList(list.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg truncate group-hover:text-gold transition-colors">
                        {list.name}
                      </h3>
                      {list.date && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(list.date), "d 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(list.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista de ensaio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A lista e todas as músicas associadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
