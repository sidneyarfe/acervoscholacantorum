import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ManageableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ id: string; name: string; value?: string }>;
  isLoading?: boolean;
  onCreate?: (name: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isCreating?: boolean;
  isDeleting?: boolean;
  useValueField?: boolean;
  disabled?: boolean;
}

export function ManageableSelect({
  value,
  onValueChange,
  placeholder,
  options,
  isLoading,
  onCreate,
  onDelete,
  isCreating,
  isDeleting,
  useValueField = false,
  disabled,
}: ManageableSelectProps) {
  const [newItemName, setNewItemName] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newItemName.trim() || !onCreate) return;
    await onCreate(newItemName.trim());
    setNewItemName("");
    setIsAddOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const getOptionValue = (option: { id: string; name: string; value?: string }) => {
    return useValueField && option.value ? option.value : option.name;
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between group"
              >
                <SelectItem
                  value={getOptionValue(option)}
                  className="flex-1 pr-8"
                >
                  {option.name}
                </SelectItem>
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 absolute right-2 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(option.id, e)}
                    disabled={isDeleting && deletingId === option.id}
                  >
                    {isDeleting && deletingId === option.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </SelectContent>
      </Select>

      {onCreate && (
        <Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-2">
              <p className="text-sm font-medium">Adicionar nova opção</p>
              <Input
                placeholder="Nome da opção"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newItemName.trim() || isCreating}
                >
                  {isCreating && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Adicionar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}