import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Calendar, Loader2, Search } from "lucide-react";
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
import { useAdminCelebrations, useDeleteCelebration, Celebration } from "@/hooks/useAdminData";
import { CelebrationForm } from "./CelebrationForm";
import { toast } from "sonner";

const rankLabels: Record<string, string> = {
  solemnity: "Solenidade",
  feast: "Festa",
  memorial: "Memória",
  optional_memorial: "Memória Opcional",
};

const rankColors: Record<string, string> = {
  solemnity: "bg-gold/10 text-gold border-gold/20",
  feast: "bg-rose/10 text-rose border-rose/20",
  memorial: "bg-primary/10 text-primary border-primary/20",
  optional_memorial: "bg-muted text-muted-foreground border-border",
};

const seasonLabels: Record<string, string> = {
  branco: "Branco",
  verde: "Verde",
  vermelho: "Vermelho",
  roxo: "Roxo",
  rosa: "Rosa",
};

const seasonColors: Record<string, string> = {
  branco: "bg-slate-100 text-slate-700 border-slate-300",
  verde: "bg-emerald-100 text-emerald-700 border-emerald-300",
  vermelho: "bg-red-100 text-red-700 border-red-300",
  roxo: "bg-purple-100 text-purple-700 border-purple-300",
  rosa: "bg-pink-100 text-pink-700 border-pink-300",
};

export function AdminCelebrationsTab() {
  const { data: celebrations, isLoading } = useAdminCelebrations();
  const deleteCelebration = useDeleteCelebration();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCelebration, setEditingCelebration] = useState<Celebration | null>(null);
  const [deleteConfirmCelebration, setDeleteConfirmCelebration] = useState<Celebration | null>(null);

  const filteredCelebrations = useMemo(() => {
    if (!celebrations) return [];
    if (!searchQuery.trim()) return celebrations;
    
    const query = searchQuery.toLowerCase();
    return celebrations.filter((celebration) =>
      celebration.name.toLowerCase().includes(query) ||
      celebration.description?.toLowerCase().includes(query) ||
      celebration.feast_type?.toLowerCase().includes(query)
    );
  }, [celebrations, searchQuery]);

  const handleEdit = (celebration: Celebration) => {
    setEditingCelebration(celebration);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmCelebration) return;
    try {
      await deleteCelebration.mutateAsync(deleteConfirmCelebration.id);
      toast.success("Celebração excluída com sucesso");
      setDeleteConfirmCelebration(null);
    } catch (error) {
      toast.error("Erro ao excluir celebração");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCelebration(null);
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
            <Calendar className="h-5 w-5 text-gold" />
            Celebrações ({celebrations?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar celebrações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Celebração</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Hierarquia Litúrgica</TableHead>
                  <TableHead className="hidden lg:table-cell">Cor Litúrgica</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo de Celebração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCelebrations.map((celebration) => (
                  <TableRow key={celebration.id}>
                    <TableCell className="font-medium">{celebration.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={rankColors[celebration.liturgical_rank]}>
                        {rankLabels[celebration.liturgical_rank]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {celebration.liturgical_season ? (
                        <Badge variant="outline" className={seasonColors[celebration.liturgical_season]}>
                          {seasonLabels[celebration.liturgical_season]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {celebration.feast_type || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(celebration)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmCelebration(celebration)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredCelebrations.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "Nenhuma celebração encontrada" : "Nenhuma celebração cadastrada"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Celebration Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCelebration ? "Editar Celebração" : "Nova Celebração"}
            </DialogTitle>
          </DialogHeader>
          <CelebrationForm celebration={editingCelebration} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmCelebration} onOpenChange={() => setDeleteConfirmCelebration(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir celebração?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConfirmCelebration?.name}"? 
              Esta ação não pode ser desfeita.
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
