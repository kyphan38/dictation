import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "grid w-full gap-1 rounded-lg border px-3 py-2.5 text-left text-sm [&>svg]:row-span-2 [&>svg]:translate-y-0.5 [&>svg]:shrink-0 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2",
  {
    variants: {
      variant: {
        default: "border-gray-700 bg-gray-900/80 text-gray-100",
        destructive:
          "border-red-500/40 bg-red-500/10 text-red-200 [&_[data-slot=alert-description]]:text-red-300/90",
        warning:
          "border-amber-500/40 bg-amber-500/10 text-amber-100 [&_[data-slot=alert-description]]:text-amber-200/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

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
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm text-pretty", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
