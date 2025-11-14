"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Package, 
  Calendar,
  Edit,
  X,
  FileText,
  Hash,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function StockMovementDetail({ movement, onClose, onEdit }) {
  if (!movement) return null

  const getTypeConfig = (type) => {
    switch (type) {
      case 'IN':
        return { label: 'Entrée Stock', icon: ArrowUp, color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'OUT':
        return { label: 'Sortie Stock', icon: ArrowDown, color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'ADJUST':
        return { label: 'Ajustement', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-50' }
      default:
        return { label: 'Inconnu', icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  const getImageUrl = (photo) => {
    if (!photo) return null
    if (photo.url) {
      return photo.url.startsWith('http') ? photo.url : `${API_URL}${photo.url}`
    }
    if (photo.data?.url) {
      return photo.data.url.startsWith('http') ? photo.data.url : `${API_URL}${photo.data.url}`
    }
    return null
  }

  const typeConfig = getTypeConfig(movement.type)
  const TypeIcon = typeConfig.icon
  const imageUrl = movement.product ? getImageUrl(movement.product.photo) : null

  return (
    <div className="flex flex-col f-100 dark:text-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Détails du mouvement</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Informations complètes sur le mouvement de stock
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          <div className="space-y-4 sm:space-y-6 py-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Informations principales */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    Informations du mouvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Type</div>
                      <Badge variant={typeConfig.variant} className={`${typeConfig.bgColor} ${typeConfig.color} text-sm`}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Quantité
                      </div>
                      <div className={`text-xl font-bold ${
                        movement.type === 'IN' ? 'text-green-600' : 
                        movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}{movement.quantity}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Référence</div>
                    <div className="font-medium">{movement.reference || 'N/A'}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date du mouvement
                    </div>
                    <div className="font-medium">
                      {movement.date ? new Date(movement.date).toLocaleString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations produit */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    Produit concerné
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {movement.product ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={movement.product.name}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{movement.product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {movement.product.documentId}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Stock avant</div>
                          <div className="font-medium">
                            {movement.type === 'IN' ? 
                              (movement.product.stock_quantity || 0) - movement.quantity :
                             movement.type === 'OUT' ? 
                              (movement.product.stock_quantity || 0) + movement.quantity :
                              movement.product.stock_quantity || 0
                            }
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Stock après</div>
                          <div className="font-medium">{movement.product.stock_quantity || 0}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Produit supprimé ou non disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {movement.description && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {movement.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Métadonnées */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Métadonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 sm:p-6">
                <div className="flex justify-between items-center text-sm py-2 border-b">
                  <span className="text-muted-foreground">ID du mouvement:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{movement.documentId}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b">
                  <span className="text-muted-foreground">Créé le:</span>
                  <span className="font-medium">{movement.createdAt ? new Date(movement.createdAt).toLocaleString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-muted-foreground">Modifié le:</span>
                  <span className="font-medium">{movement.updatedAt ? new Date(movement.updatedAt).toLocaleString('fr-FR') : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 flex justify-end gap-3 pt-6 border-t mt-6">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier le mouvement
        </Button>
      </div>
    </div>
  )
}