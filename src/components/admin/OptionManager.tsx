import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LookupOption } from "@/hooks/useSongOptions";
import { toast } from "sonner";

interface OptionManagerProps {
  label: string;
  options: LookupOption[];
  isLoading: boolean;
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
}

export function OptionManager({
  label,
  options,
  isLoading,
  onCreate,
  onDelete,
  isCreating,
  isDeleting,
}: OptionManagerProps) {
  const [newValue, setNewValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    if (!newValue.trim()) return;
    try {
      await onCreate(newValue.trim());
      setNewValue("");
      toast.success(`${label} adicionado`);
    } catch (error: any) {
      if (error?.code === "23505") {
        toast.error("Este valor já existe");
      } else {
        toast.error(`Erro ao adicionar ${label.toLowerCase()}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast.success(`${label} removido`);
    } catch (error) {
      toast.error(`Erro ao remover ${label.toLowerCase()}`);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title={`Gerenciar ${label}`}>
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-popover border border-border" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium">Gerenciar {label}</p>
          
          {/* Add new */}
          <div className="flex gap-2">
            <Input
              placeholder={`Novo ${label.toLowerCase()}`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isCreating || !newValue.trim()}
              className="h-8 px-2"
            >
              {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
          </div>

          {/* List */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : options.length ? (
              options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50"
                >
                  <span className="text-sm truncate">{option.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDelete(option.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Nenhum {label.toLowerCase()} cadastrado
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
