"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CustomerData {
  full_name: string
  phone: string
  card_code: string
  birth_date: string
  program_name: string
  status_name: string
  discount_percent: number
  bonus_percent: number
  bonus_balance: number
  max_bonus_out: number
}

interface CustomerFoundModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  customerData?: CustomerData
}

export function CustomerFoundModal({
  open,
  onClose,
  onConfirm,
  customerData = {
    full_name: "Иванов Иван Иванович",
    phone: "+7 (999) 123-45-67",
    card_code: "111",
    birth_date: "01.01.1990",
    program_name: "Золотая карта",
    status_name: "VIP клиент",
    discount_percent: 10,
    bonus_percent: 5,
    bonus_balance: 1250,
    max_bonus_out: 800,
  },
}: CustomerFoundModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-normal text-[#b8c959]">Клиент найден</h2>
          <div className="space-y-1">
            <p className="text-xl font-medium text-white">{customerData.full_name}</p>
            <div className="flex justify-center gap-4 text-base text-gray-300">
              <span>{customerData.phone}</span>
              <span>•</span>
              <span>Карта: {customerData.card_code}</span>
            </div>
            <p className="text-sm text-gray-400">Дата рождения: {customerData.birth_date}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white text-black p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">Программа лояльности</p>
              <p className="text-base font-semibold">{customerData.program_name}</p>
            </div>
            <div className="bg-white text-black p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">Статус гостя</p>
              <p className="text-base font-semibold">{customerData.status_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white text-black p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">Скидка</p>
              <p className="text-base font-semibold">{customerData.discount_percent}%</p>
            </div>
            <div className="bg-white text-black p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">% начисления бонусов</p>
              <p className="text-base font-semibold">{customerData.bonus_percent}%</p>
            </div>
          </div>

          <div className="bg-[#b8c959]/20 border border-[#b8c959] text-white p-5 rounded">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm">Баланс бонусов</p>
              <p className="text-3xl font-bold text-[#b8c959]">
                {customerData.bonus_balance.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm">Доступно к списанию</p>
              <p className="text-lg font-semibold">{customerData.max_bonus_out.toLocaleString("ru-RU")} ₽</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
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
            Ввести клиента
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
