import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full min-w-0 rounded-full border border-border-strong bg-surface px-3.5 text-body text-text-primary placeholder:text-text-muted transition-[border-color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium selection:bg-primary selection:text-text-on-primary disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text",
        // DESIGN §7.4: erro com borda de 2 px; o foco usa o anel global (§2.8)
        "aria-invalid:border-2 aria-invalid:border-danger-fg",
        className
      )}
      {...props}
    />
  )
}

export { Input }
