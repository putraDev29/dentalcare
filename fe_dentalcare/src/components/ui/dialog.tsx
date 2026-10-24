"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

export function useDialogContext() {
  const context = React.useContext(DialogContext);
  return context;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const hasDialogContent = React.Children.toArray(children).some(
    (child: any) =>
      child?.type === DialogContent ||
      child?.type?.displayName === "DialogContent"
  );

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />

        {/* Centering wrapper with scroll capability on small viewports */}
        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6 text-center">
          {hasDialogContent ? (
            children
          ) : (
            <div
              role="dialog"
              aria-modal="true"
              className={cn(
                "relative z-50 w-full max-w-lg text-left rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl transition-all animate-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain my-auto",
                className
              )}
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors z-20 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>

              {(title || description) && (
                <div className="mb-4 space-y-1 pr-8 shrink-0">
                  {title && (
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {children}
            </div>
          )}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useDialogContext();
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "relative z-50 w-full max-w-lg text-left rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl transition-all animate-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain my-auto flex flex-col",
        className
      )}
    >
      {ctx && (
        <button
          type="button"
          onClick={() => ctx.onOpenChange(false)}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors z-20 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}
DialogContent.displayName = "DialogContent";

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4 space-y-1 shrink-0", className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-900 dark:text-slate-100", className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-slate-500 dark:text-slate-400", className)}>
      {children}
    </p>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-5 flex items-center justify-end gap-2 shrink-0", className)}>
      {children}
    </div>
  );
}
