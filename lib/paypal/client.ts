"use client"

// PayPal client-side utilities
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""

export const loadPayPalScript = () => {
  if (typeof window === "undefined") return

  // Check if script is already loaded
  if ((window as any).paypal) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    script.onload = () => resolve(undefined)
    script.onerror = () => reject(new Error("Failed to load PayPal script"))
    document.head.appendChild(script)
  })
}
