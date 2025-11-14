"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, User, Shield, Calendar, Mail, Key } from 'lucide-react'
import { toast } from 'sonner'
import ProfileImageUpload from './components/profile-image-upload'
import ProfileInfoForm from './components/profile-info-form'
import ChangePasswordForm from './components/change-password-form'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileImage, setProfileImage] = useState(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/users/me?populate[profile]=*&populate[role]=*`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil')
      }
      
      const userData = await response.json()
      setUser(userData)
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      
      // التحقق من كلمات المرور إذا تم تغييرها
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas')
          setSaving(false)
          return
        }
        if (!formData.currentPassword) {
          toast.error('Veuillez entrer votre mot de passe actuel')
          setSaving(false)
          return
        }
      }

      // تحديث بيانات المستخدم
      const updateData = {
        username: formData.username,
        email: formData.email
      }

      // إضافة كلمة المرور إذا تم تغييرها
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.password = formData.newPassword
      }

      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Erreur lors de la mise à jour')
      }

      // رفع صورة الملف الشخصي إذا تم اختيار واحدة جديدة
      if (profileImage) {
        await uploadProfileImage(user.documentId, profileImage)
      }

      toast.success('Profil mis à jour avec succès!')
      fetchUserProfile() // إعادة تحميل البيانات
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const uploadProfileImage = async (userId, imageFile) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('files', imageFile)
      formData.append('ref', 'plugin::users-permissions.user')
      formData.append('refId', userId)
      formData.append('field', 'profile')

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image')
      }

      console.log('Image de profil uploadée avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error)
      throw error
    }
  }

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement du profil...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profil non trouvé</h2>
            <p className="text-muted-foreground">Impossible de charger les informations du profil.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 dark:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos informations personnelles et les paramètres de votre compte
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2"
            size="lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Photo et informations de base */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileImageUpload 
              user={user} 
              onImageChange={setProfileImage}
            />
            
            {/* Informations du compte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations du compte
                </CardTitle>
                <CardDescription>
                  Détails de votre compte et statut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Rôle:</span>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Shield className="h-3 w-3" />
                      {user.role?.name || 'Utilisateur'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Statut:</span>
                    </div>
                    <Badge variant={user.confirmed ? "default" : "secondary"} className="w-fit">
                      {user.confirmed ? "Confirmé" : "Non confirmé"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Membre depuis:</span>
                    </div>
                    <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Dernière mise à jour:</span>
                    </div>
                    <span>{new Date(user.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">ID Utilisateur:</span>
                    </div>
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {user.id}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne de droite - Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfoForm 
              formData={formData} 
              onUpdate={updateFormData} 
            />
            
            <ChangePasswordForm 
              formData={formData} 
              onUpdate={updateFormData} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}