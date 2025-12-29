"use client"

import { useRouter } from "next/navigation"
import { CreateInvoiceForm } from "@/components/invoice/create-invoice-form"
import { addInvoice, getCurrentUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { KHQRPaymentDialog } from "@/components/invoice/khqr-payment-dialog"

export default function CreateInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isKHQRDialogOpen, setIsKHQRDialogOpen] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<any>(null)

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return null
  }

  const handleSubmit = async (data: Parameters<typeof addInvoice>[0]) => {
    try {
      setIsSubmitting(true)
      const result = await addInvoice(data)
      if (result) {
        // If KHQR payment method and pending status, show KHQR dialog
        if (data.paymentMethod === "KHQR" && data.status === "pending") {
          setCreatedInvoice({
            invoiceId: parseInt(result.id),
            grandTotal: data.total,
            customerName: data.customerName,
            status: "Pending"
          })
          setIsKHQRDialogOpen(true)
          setIsSubmitting(false)
        } else {
          alert("Invoice created successfully!")
          router.push("/invoices")
        }
      } else {
        alert("Failed to create invoice. Please check stock availability.")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      // Show the actual error message
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      alert(`Failed to create invoice: ${errorMessage}`)
    } finally {
      if (!isKHQRDialogOpen) {
        setIsSubmitting(false)
      }
    }
  }

  const handlePaymentSuccess = () => {
    setIsKHQRDialogOpen(false)
    router.push("/invoices")
  }

  const handleKHQRDialogClose = (open: boolean) => {
    setIsKHQRDialogOpen(open)
    if (!open) {
      // User closed dialog without paying, redirect to invoices
      router.push("/invoices")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="mb-3 sm:mb-4 text-xs sm:text-sm">
              <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Back to Invoices
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create New Invoice</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Fill in the details to generate a new invoice</p>
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background p-4 sm:p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-foreground">Creating invoice...</p>
            </div>
          </div>
        )}

        <CreateInvoiceForm onSubmit={handleSubmit} />
      </div>

      {/* KHQR Payment Dialog */}
      {createdInvoice && (
        <KHQRPaymentDialog
          open={isKHQRDialogOpen}
          onOpenChange={handleKHQRDialogClose}
          invoice={createdInvoice}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
