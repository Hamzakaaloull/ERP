"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key } from 'lucide-react'

export default function ChangePasswordForm({ formData, onUpdate }) {
  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Changer le mot de passe
        </CardTitle>
        <CardDescription>
          Mettez à jour votre mot de passe pour sécuriser votre compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mot de passe actuel</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            placeholder="Entrez votre mot de passe actuel"
            className="bg-background"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Nouveau mot de passe"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirmer le nouveau mot de passe"
              className="bg-background"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe.
        </p>
      </CardContent>
    </Card>
  )
}