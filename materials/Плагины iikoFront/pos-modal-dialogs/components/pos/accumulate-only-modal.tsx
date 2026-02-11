"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info } from "lucide-react"

interface AccumulateOnlyModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export function AccumulateOnlyModal({ open, onClose, onConfirm }: AccumulateOnlyModalProps) {
  const [promoCode, setPromoCode] = useState("")
  const orderTotal = 1800
  const bonusEarned = 90

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-normal text-[#b8c959] text-center">Оплата заказа</h2>
          <p className="text-base text-center text-gray-300">Клиент: Петров П.П.</p>
        </div>

        <div className="space-y-5">
          <div className="flex gap-3 rounded bg-orange-500/20 border border-orange-500/40 p-4">
            <Info className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-gray-200">
              Клиент не завершил регистрацию. Бонусы можно только копить.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Промокод</label>
            <div className="flex gap-2">
              <Input
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-12 flex-1 bg-white text-black placeholder:text-gray-500"
              />
              <Button variant="outline" className="h-12 px-6 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none">
                Применить
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded bg-[#2d2d2d] p-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Сумма заказа:</span>
              <span>{orderTotal.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="h-px bg-gray-600" />
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-300">Будет начислено бонусов:</span>
              <span className="text-xl font-bold text-[#b8c959]">+{bonusEarned} ₽</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none"
          >
            Отмена
          </Button>
          <Button
            size="lg"
            onClick={onConfirm || onClose}
            className="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525]"
          >
            К оплате {orderTotal.toLocaleString("ru-RU")} ₽
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
