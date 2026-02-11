"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessModalProps {
  open: boolean
  onClose: () => void
}

export function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="relative">
            <div className="rounded-full bg-[#b8c959]/20 p-6 animate-pulse">
              <CheckCircle2 className="h-20 w-20 text-[#b8c959]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-normal text-[#b8c959]">Оплата успешна</h2>
            <p className="text-lg text-gray-300">Чек закрыт</p>
          </div>

          <div className="w-full space-y-3 rounded bg-white text-black p-5">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Списано бонусов:</span>
              <span className="font-semibold">300 ₽</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Начислено бонусов:</span>
              <span className="font-semibold text-green-600">+125 ₽</span>
            </div>
            <div className="h-px bg-gray-300" />
            <div className="flex justify-between text-lg font-bold">
              <span>Новый баланс:</span>
              <span className="text-green-600">1 075 ₽</span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525]"
          onClick={onClose}
        >
          Готово
        </Button>
      </DialogContent>
    </Dialog>
  )
}
