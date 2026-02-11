"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

interface CustomerBlockedModalProps {
  open: boolean
  onClose: () => void
  onSearchAnother?: () => void
}

export function CustomerBlockedModal({ open, onClose, onSearchAnother }: CustomerBlockedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="rounded-full bg-red-500/20 p-6">
            <ShieldAlert className="h-16 w-16 text-red-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-normal text-red-400">Карта заблокирована</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Карта клиента заблокирована. Обратитесь в службу поддержки.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none"
          >
            Закрыть
          </Button>
          <Button
            size="lg"
            onClick={onSearchAnother || onClose}
            className="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525]"
          >
            Найти другого клиента
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
