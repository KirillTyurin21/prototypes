"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface CustomerNotFoundModalProps {
  open: boolean
  onClose: () => void
  onSearchAnother?: () => void
}

export function CustomerNotFoundModal({ open, onClose, onSearchAnother }: CustomerNotFoundModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="rounded-full bg-orange-500/20 p-6">
            <AlertCircle className="h-16 w-16 text-orange-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-normal text-[#b8c959]">Клиент не найден</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Клиент не найден или не прошёл регистрацию в программе лояльности
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none"
          >
            Закрыть без клиента
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onSearchAnother || onClose}
            className="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none"
          >
            Найти другого
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="w-full h-12 text-base text-gray-400 hover:text-white hover:bg-[#2d2d2d]"
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
