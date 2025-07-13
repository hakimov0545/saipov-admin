"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "../services/api"
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalAdmins: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, adminsRes] = await Promise.all([
        apiService.getProducts({ limit: 1 }),
        apiService.getOrders(),
        apiService.getAdmins(),
      ])

      setStats({
        totalProducts: productsRes.data?.pagination?.totalProducts || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalAdmins: adminsRes.data?.admins?.length || 0,
        recentOrders: ordersRes.data?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Jami Mahsulotlar",
      value: stats.totalProducts,
      icon: Package,
      description: "Barcha mahsulotlar soni",
    },
    {
      title: "Jami Buyurtmalar",
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: "Barcha buyurtmalar soni",
    },
    {
      title: "Adminlar",
      value: stats.totalAdmins,
      icon: Users,
      description: "Tizim adminlari soni",
    },
    {
      title: "Faol Buyurtmalar",
      value: stats.recentOrders.filter((order) => order.status === "not_contacted" || order.status === "in_process")
        .length,
      icon: TrendingUp,
      description: "Jarayondagi buyurtmalar",
    },
  ]

  const getStatusText = (status) => {
    const statusMap = {
      not_contacted: "Bog'lanilmagan",
      in_process: "Jarayonda",
      delivered: "Yetkazilgan",
      cancelled: "Bekor qilingan",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      not_contacted: "bg-yellow-100 text-yellow-800",
      in_process: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colorMap[status] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Saipov Factory admin paneli umumiy ko'rinishi</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>So'nggi Buyurtmalar</CardTitle>
            <CardDescription>Eng so'nggi 5 ta buyurtma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.customer?.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Hozircha buyurtmalar yo'q</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tezkor Harakatlar</CardTitle>
            <CardDescription>Tez-tez ishlatiladigan funksiyalar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Yangi mahsulot qo'shish</div>
              <div className="text-sm text-muted-foreground">Katalogga yangi mahsulot qo'shing</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Buyurtmalarni ko'rish</div>
              <div className="text-sm text-muted-foreground">Barcha buyurtmalarni boshqaring</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Hisobot olish</div>
              <div className="text-sm text-muted-foreground">Savdo hisobotlarini ko'ring</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
