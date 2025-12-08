import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Megaphone, Loader2, Eye, EyeOff, Search, Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useUploadBannerImage, Banner } from "@/hooks/useBanners";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AdminBannersTab() {
  const { user } = useAuth();
  const { data: banners, isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const uploadImage = useUploadBannerImage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirmBanner, setDeleteConfirmBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    is_active: true,
    display_order: 0,
    drive_file_id: null as string | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredBanners = banners?.filter((banner) =>
    banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      image_url: banner.image_url || "",
      link_url: banner.link_url || "",
      is_active: banner.is_active,
      display_order: banner.display_order,
      drive_file_id: banner.drive_file_id,
    });
    setPreviewImage(banner.image_url);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      is_active: true,
      display_order: (banners?.length || 0) + 1,
      drive_file_id: null,
    });
    setPreviewImage(null);
    setIsFormOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WebP ou GIF.");
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      // Delete previous Drive file if exists
      if (formData.drive_file_id) {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.functions.invoke("delete-from-drive", {
            body: { driveFileId: formData.drive_file_id },
          });
        } catch (e) {
          console.warn("Erro ao deletar imagem anterior:", e);
        }
      }

      const result = await uploadImage.mutateAsync(file);
      setFormData((f) => ({
        ...f,
        image_url: result.imageUrl,
        drive_file_id: result.driveFileId,
      }));
      setPreviewImage(result.imageUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (formData.drive_file_id) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.functions.invoke("delete-from-drive", {
          body: { driveFileId: formData.drive_file_id },
        });
      } catch (e) {
        console.warn("Erro ao deletar imagem:", e);
      }
    }
    setFormData((f) => ({ ...f, image_url: "", drive_file_id: null }));
    setPreviewImage(null);
  };

  const handleSave = async () => {
    // Validate: must have either image or title
    if (!formData.image_url && !formData.title?.trim()) {
      toast.error("Adicione uma imagem ou um título");
      return;
    }

    try {
      if (editingBanner) {
        await updateBanner.mutateAsync({
          id: editingBanner.id,
          title: formData.title || null,
          description: formData.description || null,
          image_url: formData.image_url || null,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
          drive_file_id: formData.drive_file_id,
        });
        toast.success("Aviso atualizado com sucesso");
      } else {
        await createBanner.mutateAsync({
          title: formData.title || null,
          description: formData.description || null,
          image_url: formData.image_url || null,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
          drive_file_id: formData.drive_file_id,
          created_by: user?.id || null,
        });
        toast.success("Aviso criado com sucesso");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar aviso");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmBanner) return;
    try {
      await deleteBanner.mutateAsync({
        id: deleteConfirmBanner.id,
        driveFileId: deleteConfirmBanner.drive_file_id,
      });
      toast.success("Aviso excluído com sucesso");
      setDeleteConfirmBanner(null);
    } catch (error) {
      toast.error("Erro ao excluir aviso");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await updateBanner.mutateAsync({
        id: banner.id,
        is_active: !banner.is_active,
      });
      toast.success(banner.is_active ? "Aviso desativado" : "Aviso ativado");
    } catch (error) {
      toast.error("Erro ao atualizar aviso");
    }
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
            <Megaphone className="h-5 w-5 text-gold" />
            Avisos ({banners?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar avisos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleNew} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Aviso</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-16">Img</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="text-right w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners?.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="text-muted-foreground">
                      {banner.display_order}
                    </TableCell>
                    <TableCell>
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt=""
                          className="w-12 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.title || <span className="text-muted-foreground italic">Sem título</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                      {banner.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={banner.is_active
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {banner.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(banner)}
                          title={banner.is_active ? "Desativar" : "Ativar"}
                        >
                          {banner.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(banner)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmBanner(banner)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredBanners?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "Nenhum aviso encontrado" : "Nenhum aviso cadastrado"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Banner Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Editar Aviso" : "Novo Aviso"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Imagem do Banner</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? "Enviando..." : "Clique para fazer upload"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP ou GIF (máx. 10MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Proporção recomendada: <span className="font-medium">16:9</span> (ex: 1920x1080, 1280x720)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Ensaio especial nesta sexta (opcional)"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Se não preencher, apenas a imagem será exibida.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detalhes adicionais sobre o aviso... (opcional)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Link</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData((f) => ({ ...f, link_url: e.target.value }))}
                placeholder="https://exemplo.com"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Link para abrir ao clicar no banner.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem de Exibição</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex items-center justify-between space-y-0 pt-6">
                <Label htmlFor="is_active">Ativo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, is_active: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={createBanner.isPending || updateBanner.isPending || isUploading}>
                {(createBanner.isPending || updateBanner.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmBanner} onOpenChange={() => setDeleteConfirmBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aviso?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConfirmBanner?.title || 'este aviso'}"?
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
