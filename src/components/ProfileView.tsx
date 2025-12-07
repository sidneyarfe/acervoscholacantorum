import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Download, 
  Music2, 
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle
} from "lucide-react";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { useState } from "react";

export function ProfileView() {
  const [selectedVoice, setSelectedVoice] = useState<string | null>("tenor");

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header title="Perfil" showLogo={false} />

      <main className="flex-1 px-4 py-4 space-y-6">
        {/* User Card */}
        <Card variant="gold">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                <User className="w-8 h-8 text-gold" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold">
                  Membro da Schola
                </h2>
                <p className="text-sm text-muted-foreground">
                  membro@scholacantorum.org
                </p>
                <Badge variant="gold" className="mt-2">
                  Tenor
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Selection */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Meu Naipe
          </h2>
          <VoicePartSelector
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
          />
        </section>

        {/* Stats */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Minha Atividade
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Card variant="sacred">
              <CardContent className="p-4 text-center">
                <Music2 className="w-5 h-5 mx-auto mb-2 text-gold" />
                <p className="text-2xl font-display font-bold">12</p>
                <p className="text-[10px] text-muted-foreground">
                  Músicas acessadas
                </p>
              </CardContent>
            </Card>
            <Card variant="sacred">
              <CardContent className="p-4 text-center">
                <Download className="w-5 h-5 mx-auto mb-2 text-rose" />
                <p className="text-2xl font-display font-bold">8</p>
                <p className="text-[10px] text-muted-foreground">
                  Downloads
                </p>
              </CardContent>
            </Card>
            <Card variant="sacred">
              <CardContent className="p-4 text-center">
                <Music2 className="w-5 h-5 mx-auto mb-2 text-gold" />
                <p className="text-2xl font-display font-bold">45</p>
                <p className="text-[10px] text-muted-foreground">
                  Min. ouvidos
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Settings */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Configurações
          </h2>
          <div className="space-y-2">
            {[
              { icon: Bell, label: "Notificações", desc: "Ativadas" },
              { icon: Download, label: "Downloads", desc: "8 arquivos offline" },
              { icon: Settings, label: "Preferências", desc: "Áudio e exibição" },
              { icon: HelpCircle, label: "Ajuda", desc: "Suporte e FAQ" },
            ].map((item) => (
              <Card key={item.label} variant="interactive">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Logout */}
        <Button variant="outline" className="w-full" size="lg">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </main>
    </div>
  );
}
