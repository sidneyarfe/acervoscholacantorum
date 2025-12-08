import { useState, useMemo } from "react";
import { Users, Loader2, Shield, User, Crown, Pencil, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export function AdminUsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.display_name?.toLowerCase().includes(query) ||
      (user as any).full_name?.toLowerCase().includes(query) ||
      (user as any).email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Usuários ({users?.length || 0})
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
