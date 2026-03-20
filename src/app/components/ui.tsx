import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "danger" | "ghost" | "warning";
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-green-700 text-white hover:bg-green-800 shadow-md active:scale-[0.98]": variant === "default",
          "border-2 border-green-700 text-green-700 hover:bg-green-50": variant === "outline",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
          "hover:bg-gray-100 text-gray-700": variant === "ghost",
          "bg-yellow-500 text-white hover:bg-yellow-600": variant === "warning",
          "h-14 px-6 py-3": size === "default",
          "h-10 px-4 text-base": size === "sm",
          "h-16 px-8 text-xl": size === "lg",
          "h-14 w-14": size === "icon",
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-2xl font-bold leading-none tracking-tight text-gray-900", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "danger" | "neutral" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-green-100 text-green-800": variant === "success" || variant === "default",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-red-100 text-red-800": variant === "danger",
          "bg-gray-100 text-gray-800": variant === "neutral",
        },
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-green-600 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-800", className)}
      {...props}
    />
  );
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-3 text-lg transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-green-600 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"
