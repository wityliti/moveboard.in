"use client"

import { Button } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useState } from "react"
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"
import ErrorMessage from "../error-message"

export const RazorpayPaymentButton = ({
  session,
  notReady,
  cart,
}: {
  session: HttpTypes.StorePaymentSession
  notReady: boolean
  cart: HttpTypes.StoreCart
}) => {
  const [disabled, setDisabled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )
  const { Razorpay } = useRazorpay()

  const orderData = session.data as Record<string, string>

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = useCallback(() => {
    setSubmitting(true)

    const options: RazorpayOrderOptions = {
      callback_url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/hooks/payment/razorpay_razorpay`,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "",
      amount: orderData.amount?.toString() ?? "0",
      order_id: orderData.id ?? "",
      currency: (cart.currency_code?.toUpperCase() as CurrencyCode) ?? "INR",
      name: process.env.NEXT_PUBLIC_SHOP_NAME ?? "Moveboard",
      description: process.env.NEXT_PUBLIC_SHOP_DESCRIPTION ?? "Payment for your order",
      remember_customer: true,
      modal: {
        confirm_close: true,
      },
      handler: async () => {
        onPaymentCompleted()
      },
      prefill: {
        name:
          (cart.billing_address?.first_name ?? "") +
          " " +
          (cart.billing_address?.last_name ?? ""),
        email: cart.email ?? "",
        contact: cart.billing_address?.phone ?? "",
      },
    }

    const razorpay = new Razorpay(options)
    razorpay.open()
    razorpay.on("payment.failed", () => {
      setErrorMessage("Payment failed. Please try again.")
      setSubmitting(false)
    })
    razorpay.on("payment.cancelled", () => {
      setSubmitting(false)
    })
  }, [Razorpay, session, cart, orderData])

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid="razorpay-payment-button"
      >
        {submitting ? <Spinner /> : "Pay with Razorpay"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
    </>
  )
}
