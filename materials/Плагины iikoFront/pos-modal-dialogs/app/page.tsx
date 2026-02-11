"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { CustomerSearchModal } from "@/components/pos/customer-search-modal"
import { CustomerFoundModal } from "@/components/pos/customer-found-modal"
import { CustomerNotFoundModal } from "@/components/pos/customer-not-found-modal"
import { CustomerBlockedModal } from "@/components/pos/customer-blocked-modal"
import { PaymentModal } from "@/components/pos/payment-modal"
import { AccumulateOnlyModal } from "@/components/pos/accumulate-only-modal"
import { SuccessModal } from "@/components/pos/success-modal"
import { LoadingModal } from "@/components/pos/loading-modal"
import { ErrorModal } from "@/components/pos/error-modal"

type ModalType =
  | "search"
  | "found"
  | "not-found"
  | "blocked"
  | "payment"
  | "accumulate"
  | "success"
  | "loading"
  | "error"
  | null

export default function POSPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Кассовый терминал ресторана</h1>
        <p className="text-muted-foreground text-lg">Система программы лояльности</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
        <Button onClick={() => setActiveModal("search")} size="lg" className="h-20 text-lg">
          <CreditCard className="mr-2 h-6 w-6" />
          Поиск клиента
        </Button>

        <Button onClick={() => setActiveModal("found")} size="lg" variant="secondary" className="h-20 text-lg">
          Клиент найден
        </Button>

        <Button onClick={() => setActiveModal("not-found")} size="lg" variant="secondary" className="h-20 text-lg">
          Не найден
        </Button>

        <Button onClick={() => setActiveModal("blocked")} size="lg" variant="secondary" className="h-20 text-lg">
          Заблокирован
        </Button>

        <Button onClick={() => setActiveModal("payment")} size="lg" variant="secondary" className="h-20 text-lg">
          Оплата заказа
        </Button>

        <Button onClick={() => setActiveModal("accumulate")} size="lg" variant="secondary" className="h-20 text-lg">
          Накопление
        </Button>

        <Button onClick={() => setActiveModal("success")} size="lg" variant="secondary" className="h-20 text-lg">
          Успех
        </Button>

        <Button onClick={() => setActiveModal("loading")} size="lg" variant="secondary" className="h-20 text-lg">
          Загрузка
        </Button>

        <Button onClick={() => setActiveModal("error")} size="lg" variant="secondary" className="h-20 text-lg">
          Ошибка сети
        </Button>
      </div>

      <CustomerSearchModal open={activeModal === "search"} onClose={() => setActiveModal(null)} />

      <CustomerFoundModal open={activeModal === "found"} onClose={() => setActiveModal(null)} />

      <CustomerNotFoundModal open={activeModal === "not-found"} onClose={() => setActiveModal(null)} />

      <CustomerBlockedModal open={activeModal === "blocked"} onClose={() => setActiveModal(null)} />

      <PaymentModal open={activeModal === "payment"} onClose={() => setActiveModal(null)} />

      <AccumulateOnlyModal open={activeModal === "accumulate"} onClose={() => setActiveModal(null)} />

      <SuccessModal open={activeModal === "success"} onClose={() => setActiveModal(null)} />

      <LoadingModal open={activeModal === "loading"} />

      <ErrorModal open={activeModal === "error"} onClose={() => setActiveModal(null)} />
    </div>
  )
}
