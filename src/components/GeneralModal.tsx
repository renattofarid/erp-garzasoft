// components/GeneralModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface GeneralModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function GeneralModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}: GeneralModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v: any) => {
        // Solo permitir cerrar si NO es por clic fuera
        if (!v) {
          onClose();
        }
      }}
    >
      <DialogContent
        className={`w-[95vw] rounded-xl overflow-auto ${maxWidth}`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {subtitle && (
            <DialogDescription className="text-muted-foreground text-sm">
              {subtitle}{" "}
            </DialogDescription>
          )}
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
