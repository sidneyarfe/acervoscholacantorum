import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Calendar, Users, Shield, Megaphone } from "lucide-react";
import { AdminSongsTab } from "./AdminSongsTab";
import { AdminCelebrationsTab } from "./AdminCelebrationsTab";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminBannersTab } from "./AdminBannersTab";

export function AdminView() {
  const [activeTab, setActiveTab] = useState("songs");

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl">
            <Shield className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie músicas, celebrações, usuários e avisos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="songs" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Músicas</span>
            </TabsTrigger>
            <TabsTrigger value="celebrations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Celebrações</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Avisos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="songs">
            <AdminSongsTab />
          </TabsContent>
          <TabsContent value="celebrations">
            <AdminCelebrationsTab />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>
          <TabsContent value="banners">
            <AdminBannersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
