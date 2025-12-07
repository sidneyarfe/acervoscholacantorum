import { Music } from "lucide-react";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
        {showLogo ? (
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-gold">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-lg font-semibold leading-tight text-foreground">
                Schola Cantorum
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                Catedral de Belém
              </p>
            </div>
          </div>
        ) : (
          <h1 className="font-display text-xl lg:text-2xl font-semibold text-foreground">
            {title}
          </h1>
        )}
        
        {/* Desktop: mostrar apenas o título se não for a home */}
        {showLogo && (
          <div className="hidden lg:block">
            <h1 className="font-display text-xl font-semibold text-foreground">
              Início
            </h1>
          </div>
        )}
      </div>
    </header>
  );
}
