import { useState } from "react";
import { Users, Loader2, Shield, User, Crown, Pencil, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useAdminUsers, AdminUser } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import { UserForm } from "./UserForm";
import { CreateUserForm } from "./CreateUserForm";

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

export function AdminUsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAdminUsers();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
            <Users className="h-5 w-5 text-gold" />
            Usuários ({users?.length || 0})
          </CardTitle>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="hidden md:table-cell">Voz Preferida</TableHead>
                  <TableHead className="hidden lg:table-cell">Data de Entrada</TableHead>
                  <TableHead className="hidden lg:table-cell">Vestes</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => {
                  const RoleIcon = roleLabels[user.role]?.icon || User;
                  const isCurrentUser = user.id === currentUser?.id;
                  const hasStole = (user as any).has_stole;
                  const hasVestment = (user as any).has_vestment;
                  const joinDate = (user as any).join_date;

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
                      <TableCell className="hidden md:table-cell text-muted-foreground capitalize">
                        {user.preferred_voice || "-"}
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
                })}
                {!users?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <CreateUserForm onClose={() => setIsCreating(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}