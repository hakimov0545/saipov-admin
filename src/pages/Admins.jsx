"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "../services/api"
import { Plus, Search, Edit, Trash2, Users, Phone, Calendar } from "lucide-react"
import AdminDialog from "../components/AdminDialog"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog"
import { useAuth } from "../contexts/AuthContext"

const Admins = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [deleteAdmin, setDeleteAdmin] = useState(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await apiService.getAdmins()
      setAdmins(response.data?.admins || [])
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Adminlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (admin) => {
    setEditingAdmin(admin)
    setShowAdminDialog(true)
  }

  const handleDelete = async () => {
    try {
      await apiService.deleteAdmin(deleteAdmin._id)
      toast({
        title: "Muvaffaqiyat",
        description: "Admin muvaffaqiyatli o'chirildi",
      })
      fetchAdmins()
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error.response?.data?.message || "Adminni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setDeleteAdmin(null)
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || admin.phoneNumber?.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adminlar</h1>
          <p className="text-muted-foreground">Tizim adminlarini boshqaring</p>
        </div>
        <Button
          onClick={() => {
            setEditingAdmin(null)
            setShowAdminDialog(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi admin
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Admin qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredAdmins.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAdmins.map((admin) => (
            <Card key={admin._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {admin.fullName}
                      {admin._id === user?.id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Siz</span>
                      )}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {admin.phoneNumber}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(admin.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(admin)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {admin._id !== user?.id && (
                      <Button size="sm" variant="destructive" onClick={() => setDeleteAdmin(admin)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>Admin ID: {admin._id}</p>
                  <p>Ro'yxatdan o'tgan: {new Date(admin.createdAt).toLocaleDateString("uz-UZ")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Adminlar topilmadi</h3>
            <p className="text-gray-500 text-center mb-4">
              Hozircha adminlar yo'q yoki qidiruv natijasida hech narsa topilmadi.
            </p>
            <Button
              onClick={() => {
                setEditingAdmin(null)
                setShowAdminDialog(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Birinchi adminni qo'shing
            </Button>
          </CardContent>
        </Card>
      )}

      <AdminDialog
        open={showAdminDialog}
        onOpenChange={setShowAdminDialog}
        admin={editingAdmin}
        onSuccess={() => {
          fetchAdmins()
          setShowAdminDialog(false)
          setEditingAdmin(null)
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteAdmin}
        onOpenChange={() => setDeleteAdmin(null)}
        onConfirm={handleDelete}
        title="Adminni o'chirish"
        description={`"${deleteAdmin?.fullName}" adminini o'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo'lmaydi.`}
      />
    </div>
  )
}

export default Admins
