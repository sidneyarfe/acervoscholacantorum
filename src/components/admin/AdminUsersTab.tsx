import { useState } from "react";
import { Users, Loader2, Shield, User, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers, useUpdateUserRole } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const updateRole = useUpdateUserRole();

  const handleRoleChange = async (userId: string, role: "admin" | "moderator" | "member") => {
    try {
      await updateRole.mutateAsync({ userId, role });
      toast.success("Papel do usuário atualizado");
    } catch (error) {
      toast.error("Erro ao atualizar papel do usuário");
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gold" />
          Usuários ({users?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden md:table-cell">Voz Preferida</TableHead>
                <TableHead>Papel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => {
                const RoleIcon = roleLabels[user.role]?.icon || User;
                const isCurrentUser = user.id === currentUser?.id;

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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground capitalize">
                      {user.preferred_voice || "-"}
                    </TableCell>
                    <TableCell>
                      {isCurrentUser ? (
                        <Badge variant="outline" className={roleColors[user.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleLabels[user.role]?.label || "Membro"}
                        </Badge>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(value: "admin" | "moderator" | "member") =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={updateRole.isPending}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3 w-3" />
                                Administrador
                              </div>
                            </SelectItem>
                            <SelectItem value="moderator">
                              <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Moderador
                              </div>
                            </SelectItem>
                            <SelectItem value="member">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Membro
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!users?.length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
