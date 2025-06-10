import * as React from "react"
import { type ToastProps } from "./toast"

type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
} & Omit<ToastProps, "title" | "description">

// Toast context and provider
const ToastContext = React.createContext<{
  toasts: Toast[]
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  return (
    <ToastContext.Provider value={{ toasts, setToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    toasts: context.toasts,
    toast: (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      context.setToasts((prev) => [...prev, { ...props, id }])
    },
  }
} 