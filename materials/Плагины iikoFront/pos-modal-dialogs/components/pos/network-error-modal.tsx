"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

interface NetworkErrorModalProps {
  open: boolean
  onClose: () => void
  onRetry?: () => void
}

export function NetworkErrorModal({ open, onClose, onRetry }: NetworkErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="rounded-full bg-orange-500/20 p-6">
            <WifiOff className="h-16 w-16 text-orange-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-normal text-[#b8c959]">Ошибка соединения</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Не удалось подключиться к серверу программы лояльности. Проверьте интернет-соединение.
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
            Закрыть без клиента
          </Button>
          <Button
            size="lg"
            onClick={onRetry || onClose}
            className="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525]"
          >
            Повторить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
