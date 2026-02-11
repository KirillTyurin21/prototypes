"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RegistrationModalProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
}

export function RegistrationModal({ open, onClose, onSave }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    phone: "79001234567",
    cardNumber: "111",
    name: "Тест",
    birthDate: "",
    group: "TEST",
    gender: "Мужской",
    email: "",
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] gap-6 bg-[#3a3a3a] border-none text-white p-8 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-normal text-[#b8c959] text-center">Регистрация</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Номер телефона</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Номер карты</label>
            <Input
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              className="h-12 bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Имя</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Дата рождения</label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="h-12 bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Группа</label>
            <Input
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="h-12 bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Пол</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="h-12 w-full rounded bg-white text-black px-3"
            >
              <option>Мужской</option>
              <option>Женский</option>
            </select>
          </div>

          <div className="col-span-2 space-y-2">
            <label className="text-sm text-gray-300">E-mail</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 bg-white text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <Button variant="outline" className="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] border-none">
            Начислить
          </Button>
          <Button variant="outline" className="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] border-none">
            Списать
          </Button>
          <Button variant="outline" className="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] border-none">
            Отвязать карту
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] border-none"
          >
            Отмена
          </Button>
          <Button onClick={onSave || onClose} className="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525]">
            Изменить данные
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
