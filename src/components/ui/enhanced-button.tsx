import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg button-hover-scale",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 button-hover-scale",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground button-hover-scale",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 button-hover-scale",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground shadow-button button-hover-scale font-medium pulse-cta",
        "hero-outline": "border-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/30 button-hover-scale font-medium",
        premium: "bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground shadow-lg hover:shadow-xl button-hover-scale font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  },
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant, size, loading, loadingText, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-label={loading ? (loadingText || "Chargement en cours") : undefined}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {loading ? (loadingText || children) : children}
      </Comp>
    );
  },
);
EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };