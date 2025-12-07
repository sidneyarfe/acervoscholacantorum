import scholaLogo from "@/assets/schola-logo.png";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-8 py-2 lg:py-3">
        {showLogo ? (
          <div className="flex items-center gap-3 lg:hidden">
            <img 
              src={scholaLogo} 
              alt="Schola Cantorum" 
              className="w-12 h-12 object-contain"
            />
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
