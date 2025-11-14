"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  FolderOpen, 
  Calendar,
  Edit,
  TrendingUp,
  FileText
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function ProductDetail({ product, onClose }) {
  if (!product) return null

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

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Rupture de stock', variant: 'destructive', color: 'text-red-600' }
    if (quantity < 10) return { label: 'Stock faible', variant: 'secondary', color: 'text-orange-600' }
    return { label: 'En stock', variant: 'default', color: 'text-green-600' }
  }

  const imageUrl = getImageUrl(product.photo)
  const stockStatus = getStockStatus(product.stock_quantity)

  return (
    <div className="space-y-6 w-[60vw] overflow-y-auto box-border dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Informations complètes sur le produit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image et informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-64 h-64 rounded-lg object-cover border shadow-sm"
                />
              ) : (
                <div className="w-64 h-64 rounded-lg bg-muted flex items-center justify-center border">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold">{product.name}</h3>
                {product.unit && (
                  <p className="text-muted-foreground">Unité: {product.unit}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">ID du produit</div>
                <div className="font-mono text-sm">{product.id}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Catégorie</div>
                <Badge variant="outline" className="font-normal">
                  {product.category?.name || 'Non catégorisé'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails prix et stock */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Prix et stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Prix de vente
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {product.price ? `${Number(product.price).toFixed(2)} DH` : '0.00 DH'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Prix d'achat
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {product.price_achat ? `${Number(product.price_achat).toFixed(2)} DH` : '0.00 DH'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" />
                  Stock actuel
                </div>
                <div className="text-2xl font-bold">
                  {product.stock_quantity || 0}
                </div>
                <div className="text-sm">unités disponibles</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Statut du stock</div>
                <Badge variant={stockStatus.variant} className={`text-sm ${stockStatus.color}`}>
                  {stockStatus.label}
                </Badge>
                {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                  <p className="text-sm text-orange-600">
                    Attention: Le stock est faible. Pensez à réapprovisionner.
                  </p>
                )}
                {product.stock_quantity === 0 && (
                  <p className="text-sm text-red-600">
                    Produit en rupture de stock. Réapprovisionnement nécessaire.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créé le:</span>
                <span>{product.createdAt ? new Date(product.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Modifié le:</span>
                <span>{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Modifier le produit
        </Button>
      </div>
    </div>
  )
}