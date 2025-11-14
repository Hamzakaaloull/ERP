// components/ui/alert-manager.jsx
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export const AlertManager = {
  success: (message, description = "") => {
    toast.success(message, {
      description,
      duration: 4000,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      classNames: {
        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    })
  },

  error: (message, description = "") => {
    toast.error(message, {
      description,
      duration: 6000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      classNames: {
        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg border-red-200 dark:border-red-800",
        description: "group-[.toast]:text-muted-foreground",
      },
    })
  },

  warning: (message, description = "") => {
    toast.warning(message, {
      description,
      duration: 5000,
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      classNames: {
        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg border-yellow-200 dark:border-yellow-800",
        description: "group-[.toast]:text-muted-foreground",
      },
    })
  },

  info: (message, description = "") => {
    toast.info(message, {
      description,
      duration: 4000,
      icon: <Info className="h-5 w-5 text-blue-500" />,
      classNames: {
        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg border-blue-200 dark:border-blue-800",
        description: "group-[.toast]:text-muted-foreground",
      },
    })
  },

  loading: (message, description = "") => {
    return toast.loading(message, {
      description,
      duration: Infinity,
      classNames: {
        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
      },
    })
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId)
  },
}