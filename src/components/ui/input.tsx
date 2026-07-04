import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider placeholder:text-gray-400 outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
