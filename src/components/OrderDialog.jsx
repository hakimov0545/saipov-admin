"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "../services/api"
import { Loader2, Phone, MapPin, Package, User } from "lucide-react"

const OrderDialog = ({ open, onOpenChange, order, onSuccess }) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [cancelReason, setCancelReason] = useState("")

  const statusOptions = [
    { value: "not_contacted", label: "Bog'lanilmagan", color: "bg-yellow-100 text-yellow-800" },
    { value: "in_process", label: "Jarayonda", color: "bg-blue-100 text-blue-800" },
    { value: "delivered", label: "Yetkazilgan", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Bekor qilingan", color: "bg-red-100 text-red-800" },
  ]

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast({
        title: "Xatolik",
        description: "Iltimos, yangi holatni tanlang",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await apiService.updateOrderStatus(order._id, newStatus, internalNotes)
      toast({
        title: "Muvaffaqiyat",
        description: "Buyurtma holati muvaffaqiyatli yangilandi",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Buyurtma holatini yangilashda xatolik",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, bekor qilish sababini kiriting",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await apiService.cancelOrder(order._id, cancelReason)
      toast({
        title: "Muvaffaqiyat",
        description: "Buyurtma muvaffaqiyatli bekor qilindi",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Buyurtmani bekor qilishda xatolik",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  const currentStatus = statusOptions.find((s) => s.value === order.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Buyurtma #{order.orderNumber}
          </DialogTitle>
          <DialogDescription>Buyurtma tafsilotlari va holatini boshqarish</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Joriy holat</p>
              <Badge className={currentStatus?.color}>{currentStatus?.label}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Yaratilgan sana</p>
              <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString("uz-UZ")}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Mijoz ma'lumotlari
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium">{order.customer?.fullName}</p>
              <p className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                {order.customer?.phoneNumber}
              </p>
              {order.customer?.address && (
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {order.customer.address}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Buyurtma mahsulotlari</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Mahsulotlar soni: {item.products?.length || 0}</p>
                      <p className="text-sm text-gray-600">Mahsulot ID: {item.products?.[0] || "N/A"}</p>
                    </div>
                    <p className="text-lg font-bold">${item.totalPrice || 0}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Jami summa:</span>
                  <span className="text-lg">
                    ${order.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Holatni yangilash</h3>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="status">Yangi holat</Label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Holatni tanlang</option>
                    {statusOptions
                      .filter((s) => s.value !== order.status)
                      .map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Ichki eslatmalar (ixtiyoriy)</Label>
                  <Textarea
                    id="notes"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Buyurtma haqida qo'shimcha ma'lumotlar..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleStatusUpdate} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Holatni yangilash
                </Button>
              </div>
            </div>
          )}

          {/* Cancel Order Section */}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium text-red-600">Buyurtmani bekor qilish</h3>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="cancelReason">Bekor qilish sababi</Label>
                  <Textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Buyurtmani nima uchun bekor qilmoqchisiz?"
                    rows={2}
                  />
                </div>

                <Button variant="destructive" onClick={handleCancelOrder} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Buyurtmani bekor qilish
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Yopish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OrderDialog
