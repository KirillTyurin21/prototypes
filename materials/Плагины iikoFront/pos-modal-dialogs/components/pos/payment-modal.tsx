"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export function PaymentModal({ open, onClose, onConfirm }: PaymentModalProps) {
  const [promoCode, setPromoCode] = useState("")
  const [bonusAmount, setBonusAmount] = useState("0")
  const [isAccumulating, setIsAccumulating] = useState(false)

  const orderTotal = 2500
  const bonusDeduction = Number.parseInt(bonusAmount) || 0
  const finalAmount = orderTotal - bonusDeduction

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-normal text-[#b8c959] text-center">Оплата заказа</h2>
          <p className="text-base text-center text-gray-300">Клиент: Иванов И.И. • +7 (999) 123-45-67</p>
        </div>

        <div className="space-y-5">
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

          <div className="space-y-3 rounded bg-[#b8c959]/15 border border-[#b8c959]/40 p-5">
            <p className="text-sm text-gray-200">Доступно бонусов: 800 ₽</p>
            <Input
              type="number"
              placeholder="0"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              disabled={isAccumulating}
              className="h-14 text-xl font-semibold text-center bg-white text-black"
            />
            <p className="text-xs text-gray-300">Введите сумму бонусов для списания</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-[#1a1a1a] text-white hover:bg-[#252525] border-none"
              onClick={() => {
                setIsAccumulating(!isAccumulating)
                if (!isAccumulating) setBonusAmount("0")
              }}
            >
              {isAccumulating ? "Включить списание" : "Копить бонусы"}
            </Button>
          </div>

          <div className="space-y-2 rounded bg-[#2d2d2d] p-4">
            <div className="flex justify-between text-base">
              <span className="text-gray-300">Сумма заказа:</span>
              <span className="font-semibold">{orderTotal.toLocaleString("ru-RU")} ₽</span>
            </div>
            {bonusDeduction > 0 && (
              <div className="flex justify-between text-base text-red-400">
                <span>Списание бонусов:</span>
                <span className="font-semibold">-{bonusDeduction.toLocaleString("ru-RU")} ₽</span>
              </div>
            )}
            <div className="h-px bg-gray-600 my-2" />
            <div className="flex justify-between text-xl font-bold">
              <span>Итого к оплате:</span>
              <span className="text-[#b8c959]">{finalAmount.toLocaleString("ru-RU")} ₽</span>
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
            К оплате {finalAmount.toLocaleString("ru-RU")} ₽
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
