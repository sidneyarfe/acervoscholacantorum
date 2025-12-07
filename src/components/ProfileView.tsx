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
  HelpCircle,
  Loader2
} from "lucide-react";
import { VoicePartSelector } from "@/components/VoicePartSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const VOICE_MAP: Record<string, string> = {
  soprano: "Soprano",
  contralto: "Contralto",
  tenor: "Tenor",
  baixo: "Baixo",
};

export function ProfileView() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const handleVoiceChange = async (voice: string) => {
    try {
      await updateProfile.mutateAsync({
        preferred_voice: voice as "soprano" | "contralto" | "tenor" | "baixo",
      });
      toast({
        title: "Naipe atualizado",
        description: `Seu naipe foi alterado para ${VOICE_MAP[voice]}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o naipe.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Perfil" showLogo={false} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Perfil" showLogo={false} />

      <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-6 lg:space-y-8">
        {/* Layout Desktop: Grid */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card do Usuário */}
            <Card variant="gold">
              <CardContent className="p-5 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-8 h-8 lg:w-10 lg:h-10 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-lg lg:text-xl font-semibold">
                      {profile?.display_name || "Membro da Schola"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    {profile?.preferred_voice && (
                      <Badge variant="gold" className="mt-2">
                        {VOICE_MAP[profile.preferred_voice]}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Naipe */}
            <section>
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                Meu Naipe
              </h2>
              <VoicePartSelector
                selectedVoice={profile?.preferred_voice || null}
                onSelectVoice={handleVoiceChange}
              />
            </section>

            {/* Estatísticas */}
            <section>
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                Minha Atividade
              </h2>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <Card variant="sacred">
                  <CardContent className="p-4 lg:p-5 text-center">
                    <Music2 className="w-5 h-5 lg:w-6 lg:h-6 mx-auto mb-2 text-gold" />
                    <p className="text-2xl lg:text-3xl font-display font-bold">0</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">
                      Músicas acessadas
                    </p>
                  </CardContent>
                </Card>
                <Card variant="sacred">
                  <CardContent className="p-4 lg:p-5 text-center">
                    <Download className="w-5 h-5 lg:w-6 lg:h-6 mx-auto mb-2 text-rose" />
                    <p className="text-2xl lg:text-3xl font-display font-bold">0</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">
                      Downloads
                    </p>
                  </CardContent>
                </Card>
                <Card variant="sacred">
                  <CardContent className="p-4 lg:p-5 text-center">
                    <Music2 className="w-5 h-5 lg:w-6 lg:h-6 mx-auto mb-2 text-gold" />
                    <p className="text-2xl lg:text-3xl font-display font-bold">0</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">
                      Min. ouvidos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Coluna Lateral - Configurações */}
          <div className="mt-6 lg:mt-0 space-y-6">
            <section>
              <h2 className="font-display text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                Configurações
              </h2>
              <div className="space-y-2">
                {[
                  { icon: Bell, label: "Notificações", desc: "Ativadas" },
                  { icon: Download, label: "Downloads", desc: "0 arquivos offline" },
                  { icon: Settings, label: "Preferências", desc: "Áudio e exibição" },
                  { icon: HelpCircle, label: "Ajuda", desc: "Suporte e FAQ" },
                ].map((item) => (
                  <Card key={item.label} variant="interactive">
                    <CardContent className="p-3 lg:p-4 flex items-center justify-between">
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

            {/* Sair */}
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
