"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CustomerSearchModalProps {
  open: boolean
  onClose: () => void
}

export function CustomerSearchModal({ open, onClose }: CustomerSearchModalProps) {
  const [searchType, setSearchType] = useState<"phone" | "card">("phone")
  const [value, setValue] = useState("")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] gap-6 bg-[#3a3a3a] border-none text-white p-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-normal text-[#b8c959] text-center">Премиум бонус</h2>
          <p className="text-base text-[#b8c959] text-center">Введите номер телефона или проведите картой</p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Введите номер карты или код"
            value={searchType === "card" ? value : ""}
            onChange={(e) => {
              setSearchType("card")
              setValue(e.target.value)
            }}
            className="h-14 text-lg bg-[#b8c959]/20 border-[#b8c959] text-white placeholder:text-white/60"
          />

          <Input
            placeholder="Введите номер телефона"
            value={searchType === "phone" ? value : ""}
            onChange={(e) => {
              setSearchType("phone")
              setValue(e.target.value)
            }}
            className="h-14 text-lg bg-white text-black placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="h-16 text-2xl bg-white text-black hover:bg-gray-100 border-gray-300"
              onClick={() => setValue(value + num)}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-16 text-xl bg-white text-black hover:bg-gray-100 border-gray-300"
            onClick={() => setValue(value.slice(0, -1))}
          >
            ←
          </Button>
          <Button
            variant="outline"
            className="h-16 text-2xl bg-white text-black hover:bg-gray-100 border-gray-300"
            onClick={() => setValue(value + "0")}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-16 text-xl bg-white text-black hover:bg-gray-100 border-gray-300"
            onClick={() => setValue("")}
          >
            ✕
          </Button>
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
          <Button size="lg" className="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525]">
            ОК
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
