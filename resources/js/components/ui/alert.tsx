import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

/** Estrutura comum aos avisos tingidos: só a cor muda entre as variantes. */
const tinted =
  "rounded-card border-0 px-5 py-4 has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] [&>svg]:size-5 [&>svg]:translate-y-px *:data-[slot=alert-title]:text-label *:data-[slot=alert-title]:leading-[1.375rem] *:data-[slot=alert-title]:font-bold *:data-[slot=alert-description]:text-meta *:data-[slot=alert-description]:leading-[1.3125rem] *:data-[slot=alert-description]:text-current dark:shadow-[inset_0_0_0_1px_currentColor]"

const alertVariants = cva(
  "relative w-full rounded-card border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/80",
        // Avisos tingidos das pranchas (DESIGN §2.4): fundo e texto da cor de estado
        danger: cn(tinted, "bg-tint-danger-bg text-tint-danger-fg"),
        info: cn(tinted, "bg-tint-info-bg text-tint-info-fg"),
        warning: cn(tinted, "bg-tint-warning-bg text-tint-warning-fg"),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
