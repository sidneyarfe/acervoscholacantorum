import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import scholaLogo from "@/assets/schola-logo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { user, signOut, checkApprovalStatus, approvalStatus } = useAuth();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const handleCheckStatus = async () => {
    setChecking(true);
    await checkApprovalStatus();
    setChecking(false);
    
    // Se foi aprovado, redireciona para home
    if (approvalStatus === "approved") {
      navigate("/");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <img 
          src={scholaLogo} 
          alt="Schola Cantorum - Catedral de Belém" 
          className="w-28 h-28 object-contain"
        />
      </div>

      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-gold animate-pulse" />
            </div>
          </div>
          <h2 className="font-display text-xl font-semibold">
            Cadastro em Análise
          </h2>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Seu cadastro foi recebido e está aguardando aprovação de um administrador.
            </p>
            <p className="text-sm text-muted-foreground">
              Você receberá acesso ao sistema assim que seu cadastro for aprovado.
            </p>
          </div>

          {user && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-sm font-medium">
                {user.user_metadata?.full_name || user.user_metadata?.display_name || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCheckStatus}
              disabled={checking}
              variant="outline"
              className="w-full gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Verificando..." : "Verificar status"}
            </Button>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
