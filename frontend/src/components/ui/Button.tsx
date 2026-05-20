'use client';

import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-wide ' +
  'transition-all duration-150 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-cloud ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-sky text-white shadow-sm hover:bg-sky-600 active:bg-sky-700 active:scale-[0.98]',
  secondary:
    'bg-cloud text-sky border border-sky/30 hover:bg-soft hover:border-sky active:scale-[0.98]',
  accent:
    'bg-sunburst text-white shadow-sm hover:bg-sunburst-500 active:bg-sunburst-600 active:scale-[0.98]',
  ghost: 'bg-transparent text-navy hover:bg-navy/5 active:bg-navy/10',
  danger: 'bg-danger text-white hover:bg-danger/90 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 min-h-[3rem] px-8 text-base',
};

function renderInner(
  loading: boolean,
  leftIcon: ReactNode,
  rightIcon: ReactNode,
  children: ReactNode,
) {
  return (
    <>
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && rightIcon ? (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      ) : null}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const finalClassName = cn(base, variants[variant], sizes[size], className);

    if (asChild) {
      // Radix Slot requires exactly one React element child. If the consumer
      // supplied leftIcon / rightIcon / loading, we cannot render extra spans
      // alongside the slot child, so we inject them inside it instead.
      // Clone the user-supplied element so its children become icon+text.
      if (!isValidElement(children)) return null;
      const userChild = children as ReactElement<{ children?: ReactNode }>;
      const innerContent = renderInner(
        loading,
        leftIcon,
        rightIcon,
        userChild.props.children,
      );
      return (
        <Slot
          ref={ref as unknown as Ref<HTMLElement>}
          className={finalClassName}
          aria-busy={loading || undefined}
          {...rest}
        >
          {cloneElement(userChild, undefined, innerContent)}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={finalClassName}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {renderInner(loading, leftIcon, rightIcon, children)}
      </button>
    );
  },
);

Button.displayName = 'Button';
