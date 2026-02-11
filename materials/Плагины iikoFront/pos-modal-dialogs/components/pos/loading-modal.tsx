"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface LoadingModalProps {
  open: boolean
  message?: string
}

export function LoadingModal({ open, message = "Поиск клиента..." }: LoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[350px] gap-6" showCloseButton={false}>
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />

          <div className="space-y-2">
            <p className="text-xl font-semibold">{message}</p>
            <p className="text-sm text-muted-foreground">Подождите</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
