import { useState, useMemo } from "react";
import { Users, Loader2, Shield, User, Crown, Pencil, Plus, Search, Clock, Check, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useAdminUsers, AdminUser, useApproveUser, useRejectUser } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import { UserForm } from "./UserForm";
import { CreateUserForm } from "./CreateUserForm";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<string, { label: string; icon: typeof User }> = {
  admin: { label: "Administrador", icon: Crown },
  moderator: { label: "Moderador", icon: Shield },
  member: { label: "Membro", icon: User },
};

const roleColors: Record<string, string> = {
  admin: "bg-gold/10 text-gold border-gold/20",
  moderator: "bg-rose/10 text-rose border-rose/20",
  member: "bg-muted text-muted-foreground border-border",
};

const voiceLabels: Record<string, string> = {
  soprano: "Sopranos",
  contralto: "Contraltos",
  tenor: "Tenores",
  baixo: "Baixos",
};

const voiceColors: Record<string, string> = {
  soprano: "text-rose",
  contralto: "text-purple-600",
  tenor: "text-blue-600",
  baixo: "text-emerald-600",
};

const statusLabels: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
  afastado: { label: "Afastado", className: "bg-amber-100 text-amber-700 border-amber-200" },
  desligado: { label: "Desligado", className: "bg-red-100 text-red-700 border-red-200" },
};

export function AdminUsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAdminUsers();
  const { toast } = useToast();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [userToApprove, setUserToApprove] = useState<AdminUser | null>(null);
  const [userToReject, setUserToReject] = useState<AdminUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Separar usuários pendentes dos aprovados
  const pendingUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => user.approval_status === "pending");
  }, [users]);

  const approvedUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => user.approval_status === "approved");
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!approvedUsers) return [];
    if (!searchQuery.trim()) return approvedUsers;
    
    const query = searchQuery.toLowerCase();
    return approvedUsers.filter((user) =>
      user.display_name?.toLowerCase().includes(query) ||
      (user as any).full_name?.toLowerCase().includes(query) ||
      (user as any).email?.toLowerCase().includes(query)
    );
  }, [approvedUsers, searchQuery]);

  const usersByVoice = useMemo(() => {
    const grouped: Record<string, AdminUser[]> = {
      soprano: [],
      contralto: [],
      tenor: [],
      baixo: [],
      sem_naipe: [],
    };

    filteredUsers.forEach((user) => {
      const voice = user.preferred_voice || "sem_naipe";
      if (grouped[voice]) {
        grouped[voice].push(user);
      } else {
        grouped.sem_naipe.push(user);
      }
    });

    return grouped;
  }, [filteredUsers]);

  const handleApprove = async () => {
    if (!userToApprove || !currentUser) return;
    
    try {
      await approveUser.mutateAsync({
        userId: userToApprove.id,
        adminId: currentUser.id,
      });
      toast({
        title: "Usuário aprovado",
        description: `${userToApprove.display_name || userToApprove.full_name} foi aprovado com sucesso.`,
      });
      setUserToApprove(null);
    } catch (error) {
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!userToReject) return;
    
    try {
      await rejectUser.mutateAsync({
        userId: userToReject.id,
        reason: rejectionReason || "Cadastro não aprovado pela administração.",
      });
      toast({
        title: "Usuário recusado",
        description: `${userToReject.display_name || userToReject.full_name} foi recusado.`,
      });
      setUserToReject(null);
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Erro ao recusar",
        description: "Não foi possível recusar o usuário.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const renderUserRow = (user: AdminUser) => {
    const RoleIcon = roleLabels[user.role]?.icon || User;
    const isCurrentUser = user.id === currentUser?.id;
    const hasStole = (user as any).has_stole;
    const hasVestment = (user as any).has_vestment;
    const joinDate = (user as any).join_date;
    const memberStatus = (user as any).member_status || "ativo";
    const statusInfo = statusLabels[memberStatus] || statusLabels.ativo;

    return (
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gold/10 text-gold text-xs">
                {user.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {user.display_name || "Sem nome"}
                {isCurrentUser && (
                  <span className="text-xs text-muted-foreground ml-2">(você)</span>
                )}
              </p>
              {(user as any).full_name && (
                <p className="text-xs text-muted-foreground truncate">
                  {(user as any).full_name}
                </p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden lg:table-cell text-muted-foreground">
          {joinDate || "-"}
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          <div className="flex gap-1">
            {hasStole && (
              <Badge variant="outline" className="text-xs">
                Estola
              </Badge>
            )}
            {hasVestment && (
              <Badge variant="outline" className="text-xs">
                Veste
              </Badge>
            )}
            {!hasStole && !hasVestment && (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={roleColors[user.role]}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {roleLabels[user.role]?.label || "Membro"}
          </Badge>
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingUser(user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  const renderPendingUserRow = (user: AdminUser) => {
    return (
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gold/10 text-gold text-xs">
                {user.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {user.display_name || user.full_name || "Sem nome"}
              </p>
              {user.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {user.preferred_voice ? voiceLabels[user.preferred_voice] || user.preferred_voice : "-"}
        </TableCell>
        <TableCell className="hidden lg:table-cell text-muted-foreground">
          {user.phone || "-"}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => setUserToApprove(user)}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Aprovar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={() => setUserToReject(user)}
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Recusar</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      {/* Seção de Cadastros Pendentes */}
      {pendingUsers.length > 0 && (
        <Card className="mb-6 border-gold/30 bg-gold/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gold">
              <Clock className="h-5 w-5" />
              Cadastros Pendentes
              <Badge variant="secondary" className="bg-gold/20 text-gold">
                {pendingUsers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="hidden md:table-cell">Naipe</TableHead>
                    <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map(renderPendingUserRow)}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários Aprovados */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Usuários ({approvedUsers?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Usuário</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["soprano", "contralto", "tenor", "baixo"]} className="space-y-2">
            {(["soprano", "contralto", "tenor", "baixo"] as const).map((voice) => (
              <AccordionItem key={voice} value={voice} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-semibold ${voiceColors[voice]}`}>
                      {voiceLabels[voice]}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {usersByVoice[voice].length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {usersByVoice[voice].length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead className="hidden lg:table-cell">Data de Entrada</TableHead>
                            <TableHead className="hidden lg:table-cell">Vestes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Papel</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersByVoice[voice].map(renderUserRow)}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum usuário neste naipe
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}

            {usersByVoice.sem_naipe.length > 0 && (
              <AccordionItem value="sem_naipe" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-muted-foreground">
                      Sem Naipe Definido
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {usersByVoice.sem_naipe.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead className="hidden lg:table-cell">Data de Entrada</TableHead>
                          <TableHead className="hidden lg:table-cell">Vestes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Papel</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersByVoice.sem_naipe.map(renderUserRow)}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm
              user={editingUser}
              onClose={() => setEditingUser(null)}
              isCurrentUser={editingUser.id === currentUser?.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <CreateUserForm onClose={() => setIsCreating(false)} />
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Aprovação */}
      <AlertDialog open={!!userToApprove} onOpenChange={() => setUserToApprove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Cadastro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar o cadastro de{" "}
              <strong>{userToApprove?.display_name || userToApprove?.full_name}</strong>?
              <br />
              O usuário terá acesso completo ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Rejeição */}
      <Dialog open={!!userToReject} onOpenChange={() => {
        setUserToReject(null);
        setRejectionReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Recusar Cadastro
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da recusa para{" "}
              <strong>{userToReject?.display_name || userToReject?.full_name}</strong>.
              Este motivo será exibido ao usuário quando tentar fazer login.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Dados incompletos, não é membro do coro, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUserToReject(null);
              setRejectionReason("");
            }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              Recusar Cadastro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
