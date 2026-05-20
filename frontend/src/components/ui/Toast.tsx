'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <Toaster>');
  return ctx;
}

const toneStyles: Record<ToastTone, { container: string; icon: ReactNode }> = {
  success: {
    container: 'border-success/30 bg-cloud',
    icon: <CheckCircle2 className="size-5 text-success" aria-hidden />,
  },
  error: {
    container: 'border-danger/30 bg-cloud',
    icon: <AlertCircle className="size-5 text-danger" aria-hidden />,
  },
  info: {
    container: 'border-sky/30 bg-cloud',
    icon: <CheckCircle2 className="size-5 text-sky" aria-hidden />,
  },
};

export function Toaster({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { ...item, id }]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            onOpenChange={(open) => {
              if (!open) remove(item.id);
            }}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-cloud p-4 shadow-elevated',
              'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-fade-in',
              toneStyles[item.tone].container,
            )}
          >
            {toneStyles[item.tone].icon}
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold text-navy">
                {item.title}
              </ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="mt-0.5 text-sm text-charcoal-400">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className="shrink-0 rounded p-1 text-charcoal-300 hover:bg-charcoal-50 hover:text-charcoal"
              aria-label="Close notification"
            >
              <X className="size-4" aria-hidden />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-full flex-col gap-2 sm:bottom-6 sm:right-6" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitive.Title>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...rest }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...rest} />
));
ToastTitle.displayName = 'ToastTitle';
