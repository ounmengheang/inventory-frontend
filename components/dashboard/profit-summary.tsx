"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { calculateProfitAnalytics } from "@/lib/analytics"
import { isManagerOrAdmin } from "@/lib/permissions"

interface ProfitAnalytics {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  topProfitableProducts: Array<{
    name: string
    revenue: number
    cost: number
    profit: number
    units: number
  }>
}

export function ProfitSummary() {
  const [analytics, setAnalytics] = useState<ProfitAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isManagerOrAdmin()) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const data = await calculateProfitAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to load profit analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!isManagerOrAdmin()) {
    return null
  }

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Profit Analytics</CardTitle>
          <CardDescription>Loading profit data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 col-span-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${analytics.totalProfit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            From ${analytics.totalRevenue.toFixed(2)} revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.profitMargin.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Average margin on sales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            ${analytics.totalCost.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Cost of goods sold
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Top Profitable Products</CardTitle>
          <CardDescription>Products generating the most profit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topProfitableProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.units} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    ${product.profit.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((product.profit / product.revenue) * 100).toFixed(1)}% margin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
