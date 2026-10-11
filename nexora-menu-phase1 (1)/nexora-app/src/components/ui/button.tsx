import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Signature gold-gradient CTA — used sparingly, one per view.
        gold: "bg-gold-gradient text-void shadow-glow-gold hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(200,155,60,0.55)]",
        // Neutral glass button for secondary actions.
        ghost:
          "border border-white/10 bg-white/[0.04] text-foreground backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.08]",
        // Solid white/ink button for high-contrast secondary CTAs.
        solid: "bg-foreground text-void hover:-translate-y-0.5 hover:shadow-lg",
        outline:
          "border border-gold/40 text-gold hover:bg-gold/10",
        destructive: "bg-red-500/90 text-white hover:bg-red-500",
        link: "text-gold underline-offset-4 hover:underline",
        icon: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-[13px]",
        lg: "h-12 rounded-xl px-8 text-[15px]",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
