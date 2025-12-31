"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, X, Plus, Trash2, CheckCircle, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PurchaseOrderDialog } from "./purchase-order-dialog"
import { InvoiceGenerator } from "./invoice-generator"
import { canWrite } from "@/lib/permissions"

interface Invoice {
  invoiceId: number
  customer: number | null
  customerName?: string
  customerPhone?: string
  createdByUser: number | null
  createdByUsername?: string
  totalBeforeDiscount: string
  discount: string
  tax: string
  grandTotal: string
  paymentMethod: string
  note: string | null
  status: string
  qrReference: string | null
  createdAt: string
  paidAt: string | null
  purchases?: Purchase[]
  khqrMd5?: string | null
  khqrTransactionHash?: string | null
  khqrShortHash?: string | null
  khqrDeeplink?: string | null
  khqrLastCheckedAt?: string | null
  khqrPaymentData?: any
}

interface Purchase {
  purchaseId: number
  product: number | null
  productName?: string
  quantity: number
  pricePerUnit: string
  discount: string
  subtotal: string
}

export function PurchaseOrderTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isInvoiceGeneratorOpen, setIsInvoiceGeneratorOpen] = useState(false)
  const [invoiceToGenerate, setInvoiceToGenerate] = useState<Invoice | null>(null)
  const [checkingPayments, setCheckingPayments] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Check payment status for pending KHQR invoices when page loads
  useEffect(() => {
    if (!isLoading && invoices.length > 0) {
      checkPendingPayments()
    }
  }, [isLoading])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/api/invoices/", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Sort by createdAt descending (newest first)
        const sortedData = data.sort((a: Invoice, b: Invoice) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setInvoices(sortedData)
      } else {
        const errorText = await response.text()
        console.error("Failed to fetch invoices. Status:", response.status)
        console.error("Response:", errorText)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPendingPayments = async () => {
    // Find all pending KHQR invoices with MD5 hash
    const pendingKHQRInvoices = invoices.filter(
      (inv) => inv.status === "Pending" && inv.paymentMethod === "KHQR" && inv.khqrMd5
    )

    if (pendingKHQRInvoices.length === 0) {
      console.log("ℹ️ No pending KHQR payments to check")
      return
    }

    console.log(`🔍 Checking payment status for ${pendingKHQRInvoices.length} pending KHQR invoice${pendingKHQRInvoices.length > 1 ? 's' : ''}...`)
    console.log(`   Invoice IDs: ${pendingKHQRInvoices.map(inv => inv.invoiceId).join(', ')}`)

    // Check each pending invoice
    for (const invoice of pendingKHQRInvoices) {
      await checkSinglePayment(invoice.invoiceId)
    }
  }

  const checkSinglePayment = async (invoiceId: number) => {
    if (checkingPayments.has(invoiceId)) {
      return // Already checking this invoice
    }

    setCheckingPayments((prev) => new Set(prev).add(invoiceId))

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoiceId}/check_payment/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.paid) {
          console.log(`✅ Payment confirmed for invoice #${invoiceId}!`)
          console.log(`   Amount: ${result.amount} ${result.currency}`)
          console.log(`   From: ${result.from_account}`)
          // Refresh invoices to show updated status
          fetchInvoices()
        } else {
          console.log(`⏳ Payment not yet received for invoice #${invoiceId}`)
          if (result.message) {
            console.log(`   ${result.message}`)
          }
        }
      } else {
        // Parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetail = ''
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.detail) {
            errorMessage = errorData.detail
          }
          if (errorData.detail) {
            errorDetail = errorData.detail
          }
        } catch (e) {
          // Failed to parse JSON error response
        }
        
        console.error(`❌ Failed to check payment for invoice #${invoiceId}`)
        console.error(`   Error: ${errorMessage}`)
        if (errorDetail && errorDetail !== errorMessage) {
          console.error(`   Details: ${errorDetail}`)
        }
        
        // Handle specific error codes
        if (response.status === 400) {
          console.warn(`   ℹ️ This invoice may not have KHQR payment setup`)
        } else if (response.status === 503) {
          console.warn(`   ℹ️ KHQR payment verification service is unavailable`)
          console.warn(`   ℹ️ Check your KHQR API token configuration in backend/.env`)
        } else if (response.status === 500) {
          console.warn(`   ℹ️ Server error occurred. Check backend logs for details.`)
        }
      }
    } catch (error) {
      console.error(`❌ Error checking payment for invoice #${invoiceId}:`, error)
    } finally {
      setCheckingPayments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(invoiceId)
        return newSet
      })
    }
  }

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (!confirm(`Mark order INV-${invoice.invoiceId} as paid?`)) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoice.invoiceId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Paid" }),
      })

      if (response.ok) {
        fetchInvoices()
        alert("Order marked as paid and transaction recorded!")
      } else {
        const error = await response.text()
        console.error("Error marking as paid:", error)
        alert("Failed to mark order as paid")
      }
    } catch (error) {
      console.error("Error marking as paid:", error)
      alert("Error marking as paid")
    }
  }

  const handleDelete = async (invoiceId: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoiceId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      if (response.ok || response.status === 204) {
        fetchInvoices()
      } else {
        alert("Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("Error deleting order")
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceId.toString().includes(searchTerm) ||
        invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  const hasActiveFilters = statusFilter !== "all"

  const clearFilters = () => {
    setStatusFilter("all")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Payment checking notification */}
      {checkingPayments.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-800">
            Checking payment status for {checkingPayments.size} invoice{checkingPayments.size > 1 ? 's' : ''}...
          </span>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        {/* Search and Add Button Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {canWrite() && (
            <Button
              onClick={() => {
                setSelectedInvoice(null)
                setIsDialogOpen(true)
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-3 text-sm">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}

          {/* Results Count */}
          <span className="ml-auto text-sm text-muted-foreground">
            Showing {filteredInvoices.length} of {invoices.length} orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm min-w-[100px]">Order ID</TableHead>
              <TableHead className="text-xs sm:text-sm min-w-[120px]">Created Date</TableHead>
              <TableHead className="text-xs sm:text-sm min-w-[150px]">Customer</TableHead>
              <TableHead className="text-xs sm:text-sm min-w-[100px]">Payment</TableHead>
              <TableHead className="text-right text-xs sm:text-sm min-w-[100px]">Total</TableHead>
              <TableHead className="text-xs sm:text-sm min-w-[100px]">Status</TableHead>
              <TableHead className="text-xs sm:text-sm min-w-[120px]">Paid At</TableHead>
              <TableHead className="text-xs sm:text-sm min-w-[120px]">Created By</TableHead>
              <TableHead className="text-right text-xs sm:text-sm min-w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow 
                  key={invoice.invoiceId}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedInvoice(invoice)
                    setIsDialogOpen(true)
                  }}
                >
                  <TableCell className="font-mono">INV-{invoice.invoiceId}</TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{invoice.customerName}</span>
                      {invoice.customerPhone && (
                        <span className="text-xs text-muted-foreground">{invoice.customerPhone}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                      {invoice.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${parseFloat(invoice.grandTotal).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      {checkingPayments.has(invoice.invoiceId) && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs animate-pulse">
                          Checking...
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.paidAt ? (
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-green-700">
                          {new Date(invoice.paidAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(invoice.paidAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {invoice.createdByUsername || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {invoice.status === "Pending" && invoice.paymentMethod === "KHQR" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => checkSinglePayment(invoice.invoiceId)}
                          title="Check payment status"
                          className="text-blue-600 hover:text-blue-700"
                          disabled={checkingPayments.has(invoice.invoiceId)}
                        >
                          <RefreshCw className={`h-4 w-4 ${checkingPayments.has(invoice.invoiceId) ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      {invoice.status === "Pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsPaid(invoice)}
                          title="Mark as paid"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setInvoiceToGenerate(invoice)
                          setIsInvoiceGeneratorOpen(true)
                        }}
                        title="Generate invoice"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {canWrite() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.invoiceId)}
                          title="Delete order"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PurchaseOrderDialog
        invoice={selectedInvoice}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          fetchInvoices()
          setIsDialogOpen(false)
          setSelectedInvoice(null)
        }}
      />

      {isInvoiceGeneratorOpen && invoiceToGenerate && (
        <InvoiceGenerator
          invoice={invoiceToGenerate}
          onClose={() => {
            setIsInvoiceGeneratorOpen(false)
            setInvoiceToGenerate(null)
          }}
        />
      )}
    </div>
  )
}
