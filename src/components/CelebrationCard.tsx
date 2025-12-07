import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Celebration = Tables<"celebrations">;

interface CelebrationCardProps {
  celebration: Celebration;
  onClick?: () => void;
  showArrow?: boolean;
}

const LITURGICAL_RANK_LABELS: Record<string, string> = {
  solemnity: "Solenidade",
  feast: "Festa",
  memorial: "Memorial",
  optional_memorial: "Memorial Opcional",
};

const LITURGICAL_SEASON_LABELS: Record<string, string> = {
  branco: "Branco",
  verde: "Verde",
  vermelho: "Vermelho",
  roxo: "Roxo",
  rosa: "Rosa",
};

// Subtle background colors for each liturgical season
const LITURGICAL_SEASON_STYLES: Record<string, string> = {
  branco: "bg-white border-slate-200",
  verde: "bg-emerald-50/50 border-emerald-200/50",
  vermelho: "bg-red-50/50 border-red-200/50",
  roxo: "bg-purple-50/50 border-purple-200/50",
  rosa: "bg-pink-50/50 border-pink-200/50",
};

// Badge colors for liturgical seasons
const LITURGICAL_SEASON_BADGE_STYLES: Record<string, string> = {
  branco: "bg-slate-100 text-slate-700 border-slate-300",
  verde: "bg-emerald-100 text-emerald-700 border-emerald-300",
  vermelho: "bg-red-100 text-red-700 border-red-300",
  roxo: "bg-purple-100 text-purple-700 border-purple-300",
  rosa: "bg-pink-100 text-pink-700 border-pink-300",
};

export function CelebrationCard({ celebration, onClick, showArrow = true }: CelebrationCardProps) {
  const seasonStyle = celebration.liturgical_season 
    ? LITURGICAL_SEASON_STYLES[celebration.liturgical_season] 
    : "";
  
  const seasonBadgeStyle = celebration.liturgical_season 
    ? LITURGICAL_SEASON_BADGE_STYLES[celebration.liturgical_season] 
    : "";

  return (
    <Card
      variant="interactive"
      className={cn(
        "cursor-pointer transition-all",
        seasonStyle
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                variant={
                  celebration.liturgical_rank === "solemnity"
                    ? "gold"
                    : celebration.liturgical_rank === "feast"
                    ? "rose"
                    : "outline"
                }
                className="text-[10px]"
              >
                {LITURGICAL_RANK_LABELS[celebration.liturgical_rank]}
              </Badge>
              {celebration.liturgical_season && (
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", seasonBadgeStyle)}
                >
                  {LITURGICAL_SEASON_LABELS[celebration.liturgical_season]}
                </Badge>
              )}
              {celebration.feast_type && (
                <Badge variant="outline" className="text-[10px]">
                  {celebration.feast_type}
                </Badge>
              )}
            </div>
            <h3 className="font-display font-semibold text-base mb-1">
              {celebration.name}
            </h3>
            {celebration.description && (
              <p className="text-sm text-muted-foreground">
                {celebration.description}
              </p>
            )}
            {celebration.date_rule && (
              <p className="text-xs text-gold mt-2 font-medium">
                {celebration.date_rule}
              </p>
            )}
          </div>
          {showArrow && (
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-4" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
