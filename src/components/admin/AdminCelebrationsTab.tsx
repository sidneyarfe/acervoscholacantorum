import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function AdminCelebrationsTab() {
  const { data: celebrations, isLoading } = useAdminCelebrations();
  const deleteCelebration = useDeleteCelebration();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCelebration, setEditingCelebration] = useState<Celebration | null>(null);
  const [deleteConfirmCelebration, setDeleteConfirmCelebration] = useState<Celebration | null>(null);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            Celebrações ({celebrations?.length || 0})
          </CardTitle>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Celebração
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Hierarquia Litúrgica</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo de Celebração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {celebrations?.map((celebration) => (
                  <TableRow key={celebration.id}>
                    <TableCell className="font-medium">{celebration.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={rankColors[celebration.liturgical_rank]}>
                        {rankLabels[celebration.liturgical_rank]}
                      </Badge>
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
                {!celebrations?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma celebração cadastrada
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
