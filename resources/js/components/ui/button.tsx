import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,background-color,box-shadow,transform] duration-(--duration-fast) ease-standard motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:text-disabled-text disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-text-on-primary shadow-xs hover:bg-primary-hover active:bg-primary-active disabled:bg-disabled-bg",
        destructive:
          "bg-danger-bg text-danger-on-bg shadow-xs hover:shadow-hover disabled:bg-disabled-bg",
        outline:
          "border border-border-strong bg-surface text-text-primary shadow-xs hover:bg-surface-hover disabled:bg-disabled-bg",
        secondary:
          "bg-surface-muted text-text-primary shadow-xs hover:bg-surface-selected disabled:bg-disabled-bg",
        ghost: "text-text-primary hover:bg-surface-hover",
        // Ação secundária sem fundo, na cor de link (prancha "Link enviado")
        subtle: "font-bold text-primary-text hover:bg-surface-hover disabled:bg-transparent",
        link: "text-primary-text underline underline-offset-4 hover:text-text-primary",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        // Ação principal de formulário (pranchas de entrar e criar conta)
        xl: "h-13 rounded-full px-6 text-body font-bold shadow-sm motion-safe:hover:-translate-y-px",
        md: "h-11 rounded-full px-[18px] text-[0.9375rem]",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
