"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

interface ErrorModalProps {
  open: boolean
  onClose: () => void
}

export function ErrorModal({ open, onClose }: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] gap-6">
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="rounded-full bg-destructive/20 p-4">
            <WifiOff className="h-16 w-16 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Ошибка соединения</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Не удалось подключиться к серверу программы лояльности. Проверьте интернет-соединение.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={onClose} className="h-14 text-base bg-transparent">
            Закрыть без клиента
          </Button>
          <Button size="lg" className="h-14 text-base">
            Повторить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
