import { cn } from "@/lib/utils";
import { VOICE_PARTS } from "@/lib/data";

interface VoicePartSelectorProps {
  selectedVoice: string | null;
  onSelectVoice: (voiceId: string) => void;
}

export function VoicePartSelector({ selectedVoice, onSelectVoice }: VoicePartSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {VOICE_PARTS.map((voice, index) => {
        const isSelected = selectedVoice === voice.id;
        const isHighVoice = voice.abbreviation === "S" || voice.abbreviation === "A";
        
        return (
          <button
            key={voice.id}
            onClick={() => onSelectVoice(voice.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
              "hover:scale-105 active:scale-95",
              isSelected
                ? isHighVoice
                  ? "border-rose bg-rose/10 shadow-soft"
                  : "border-gold bg-gold/10 shadow-gold"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {/* Círculo do Naipe */}
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-display mb-2 transition-all duration-300",
                isSelected
                  ? isHighVoice
                    ? "bg-rose text-secondary-foreground shadow-soft"
                    : "bg-gold text-primary-foreground shadow-gold"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {voice.abbreviation}
            </div>
            
            {/* Nome do Naipe */}
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {voice.name}
            </span>

            {/* Indicador de seleção */}
            {isSelected && (
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                  isHighVoice
                    ? "bg-rose text-secondary-foreground"
                    : "bg-gold text-primary-foreground"
                )}
              >
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
