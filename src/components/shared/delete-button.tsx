"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
}

export function DeleteButton({ action, label = "Löschen" }: DeleteButtonProps) {
  return (
    <form
      action={async () => {
        if (confirm(`Wirklich ${label.toLowerCase()}?`)) {
          await action();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
