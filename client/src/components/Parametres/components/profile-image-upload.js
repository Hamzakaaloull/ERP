"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, X, User } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function ProfileImageUpload({ user, onImageChange }) {
  const [previewUrl, setPreviewUrl] = useState(user?.profile ? getImageUrl(user.profile) : '')

  function getImageUrl(profile) {
    if (!profile) return ''
    if (profile.url) {
      return profile.url.startsWith('http') ? profile.url : `${API_URL}${profile.url}`
    }
    return ''
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // التحقق من حجم الملف (10MB كحد أقصى)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La taille du fichier ne doit pas dépasser 10MB')
        return
      }
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image valide')
        return
      }

      onImageChange(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    onImageChange(null)
    setPreviewUrl('')
    const fileInput = document.getElementById('profile-image')
    if (fileInput) fileInput.value = ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo de profil</CardTitle>
        <CardDescription>
          Ajoutez une photo pour personnaliser votre profil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Photo de profil"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          <Label htmlFor="profile-image" className="cursor-pointer">
            <Button type="button" variant="outline" asChild>
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {previewUrl ? 'Changer la photo' : 'Ajouter une photo'}
              </span>
            </Button>
            <Input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </Label>
          
          <p className="text-sm text-muted-foreground text-center">
            PNG, JPG, JPEG jusqu'à 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  )
}