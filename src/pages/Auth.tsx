import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { 
  Mail, Lock, User, Eye, EyeOff, Loader2, 
  Phone, MapPin, Calendar, Music, ArrowLeft, CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import scholaLogo from "@/assets/schola-logo.png";

// Funções de formatação
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(numbers[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10 || d1 === 11) d1 = 0;
  if (d1 !== parseInt(numbers[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(numbers[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10 || d2 === 11) d2 = 0;
  return d2 === parseInt(numbers[10]);
};

const isValidPhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

// Validação com Zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  phone: z.string().refine(isValidPhone, "Telefone inválido"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  preferredVoice: z.string().min(1, "Selecione um naipe"),
  joinDate: z.string().min(1, "Informe a data de entrada"),
});

type FormErrors = Partial<Record<keyof z.infer<typeof signUpSchema>, string>>;

const voiceOptions = [
  { value: "soprano", label: "Soprano" },
  { value: "contralto", label: "Contralto" },
  { value: "tenor", label: "Tenor" },
  { value: "baixo", label: "Baixo" },
];

type AuthMode = "login" | "signup" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);

  // Campos do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredVoice, setPreferredVoice] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [hasStole, setHasStole] = useState(false);
  const [hasVestment, setHasVestment] = useState(false);
  const { signUp, signIn, user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (mode === "signup") {
        signUpSchema.parse({ 
          email, password, fullName, cpf, phone, address, preferredVoice, joinDate 
        });
      } else if (mode === "forgot") {
        z.string().email("Email inválido").parse(email);
      } else {
        loginSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, {
          fullName,
          cpf: cpf.replace(/\D/g, ''),
          phone: phone.replace(/\D/g, ''),
          address,
          preferredVoice,
          joinDate,
          hasStole,
          hasVestment,
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Usuário já cadastrado",
              description: "Este email já está registrado. Tente fazer login.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Conta criada!",
            description: "Bem-vindo à Schola Cantorum!",
          });
          navigate("/");
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        
        if (error) {
          toast({
            title: "Erro ao enviar email",
            description: "Verifique se o email está correto e tente novamente.",
            variant: "destructive",
          });
        } else {
          setRecoveryEmailSent(true);
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: "Credenciais inválidas",
              description: "Email ou senha incorretos.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro no login",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setCpf("");
    setPhone("");
    setAddress("");
    setPreferredVoice("");
    setJoinDate("");
    setHasStole(false);
    setHasVestment(false);
    setErrors({});
    setRecoveryEmailSent(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Criar Conta";
      case "forgot": return "Recuperar Senha";
      default: return "Entrar";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "signup": return "Preencha seus dados para acessar o acervo musical";
      case "forgot": return "Informe seu email para receber o link de recuperação";
      default: return "Entre com suas credenciais";
    }
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
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                resetForm();
              }}
              className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h2 className="font-display text-xl font-semibold">
            {getTitle()}
          </h2>
          <p className="text-sm text-muted-foreground">
            {getSubtitle()}
          </p>
        </CardHeader>

        <CardContent>
          {/* Formulário de Recuperação - Email enviado */}
          {mode === "forgot" && recoveryEmailSent ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-medium text-lg">Email enviado!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className="mt-4"
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" ? (
                <>
                  {/* Dados Pessoais */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                      Dados Pessoais
                    </h3>
                    
                    {/* Nome Completo */}
                    <div className="space-y-1">
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Seu nome completo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    {/* CPF */}
                    <div className="space-y-1">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        disabled={loading}
                      />
                      {errors.cpf && (
                        <p className="text-xs text-destructive">{errors.cpf}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div className="space-y-1">
                      <Label htmlFor="phone">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="text"
                          placeholder="(00) 00000-0000"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="space-y-1">
                      <Label htmlFor="address">Endereço *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          type="text"
                          placeholder="Rua, número, bairro"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-xs text-destructive">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Dados da Schola */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                      Dados da Schola
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Naipe */}
                      <div className="space-y-1">
                        <Label htmlFor="preferredVoice">Naipe *</Label>
                        <Select value={preferredVoice} onValueChange={setPreferredVoice} disabled={loading}>
                          <SelectTrigger>
                            <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {voiceOptions.map((voice) => (
                              <SelectItem key={voice.value} value={voice.value}>
                                {voice.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.preferredVoice && (
                          <p className="text-xs text-destructive">{errors.preferredVoice}</p>
                        )}
                      </div>

                      {/* Data de Entrada */}
                      <div className="space-y-1">
                        <Label htmlFor="joinDate">Data de Entrada *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="joinDate"
                            type="date"
                            value={joinDate}
                            onChange={(e) => setJoinDate(e.target.value)}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                        {errors.joinDate && (
                          <p className="text-xs text-destructive">{errors.joinDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Itens que possui */}
                    <div className="space-y-2">
                      <Label>Itens que possui</Label>
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasVestment" 
                            checked={hasVestment}
                            onCheckedChange={(checked) => setHasVestment(checked === true)}
                            disabled={loading}
                          />
                          <Label htmlFor="hasVestment" className="text-sm font-normal cursor-pointer">
                            Veste
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="hasStole" 
                            checked={hasStole}
                            onCheckedChange={(checked) => setHasStole(checked === true)}
                            disabled={loading}
                          />
                          <Label htmlFor="hasStole" className="text-sm font-normal cursor-pointer">
                            Estola
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados de Acesso */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                      Dados de Acesso
                    </h3>

                    {/* Email */}
                    <div className="space-y-1">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>

                    {/* Senha */}
                    <div className="space-y-1">
                      <Label htmlFor="password">Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : mode === "forgot" ? (
                <>
                  {/* Formulário de Recuperação */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Login simples */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Link esqueci senha */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setErrors({});
                      }}
                      className="text-sm text-gold hover:text-gold-dark"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="gold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "signup" ? "Criando conta..." : 
                     mode === "forgot" ? "Enviando..." : "Entrando..."}
                  </>
                ) : mode === "signup" ? (
                  "Criar Conta"
                ) : mode === "forgot" ? (
                  "Enviar link de recuperação"
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          )}

          {(mode === "login" || mode === "signup") && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "signup" ? "Já tem uma conta?" : "Não tem uma conta?"}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signup" ? "login" : "signup");
                    resetForm();
                  }}
                  className="ml-1 text-gold hover:text-gold-dark font-medium"
                >
                  {mode === "signup" ? "Entrar" : "Cadastrar-se"}
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm">
        Desde 1735, preservando a tradição da música sacra na Catedral de Belém
      </p>
    </div>
  );
}
