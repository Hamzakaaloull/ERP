"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  ShoppingCart,
  User,
  ArrowLeft,
  FileText,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  ArrowUpDown
} from 'lucide-react'
import CreateSaleDialog from './components/create-sale-dialog'
import SaleDetailsDialog from './components/sale-details-dialog'
import EditSaleDialog from './components/edit-sale-dialog'

// Import corrigé pour l'export PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [allSales, setAllSales] = useState([]) // Store all sales
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isCreatingSale, setIsCreatingSale] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [expanded, setExpanded] = useState(false) // State for expanding table
  const [visibleSalesCount, setVisibleSalesCount] = useState(25) // Default visible sales
  const [paginationMeta, setPaginationMeta] = useState(null) // Store pagination metadata
  const [sortConfig, setSortConfig] = useState({ key: 'sale_date', direction: 'desc' }) // Sort configuration

  useEffect(() => {
    fetchAllSales() // Fetch all sales without pagination
    fetchClients()
  }, [])

  const fetchAllSales = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // First, get total count to determine pagination
      const countResponse = await fetch(
        `${API_URL}/api/sales?pagination[pageSize]=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!countResponse.ok) {
        throw new Error(`HTTP error! status: ${countResponse.status}`)
      }
      
      const countData = await countResponse.json()
      console.log('Données de comptage des ventes:', countData)
      const total = countData.meta?.pagination?.total || 100
      
      // Fetch all sales with their real IDs
      const response = await fetch(
        `${API_URL}/api/sales?pagination[pageSize]=${total}&populate=client&populate=user&populate=sale_items.product&sort=id:desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && data.data) {
        // Sort by ID descending by default
        const sortedData = [...data.data].sort((a, b) => {
          return b.id - a.id // Descending by real ID
        })
        
        setAllSales(sortedData) // Store all sales
        setSales(sortedData.slice(0, visibleSalesCount)) // Show only first 25 by default
        setPaginationMeta(data.meta)
      } else {
        console.error('Structure de données inattendue:', data)
        setAllSales([])
        setSales([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error)
      setAllSales([])
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  // Function to sort sales
  const sortSales = (key) => {
    let direction = 'desc'
    
    // If clicking the same column, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    
    setSortConfig({ key, direction })
    
    const sortedAllSales = [...allSales].sort((a, b) => {
      let aValue, bValue
      
      switch (key) {
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        case 'documentId':
          aValue = a.documentId || ''
          bValue = b.documentId || ''
          break
        case 'client':
          aValue = a.client?.name || ''
          bValue = b.client?.name || ''
          break
        case 'total_amount':
          aValue = a.total_amount || 0
          bValue = b.total_amount || 0
          break
        case 'paid_amount':
          aValue = a.paid_amount || 0
          bValue = b.paid_amount || 0
          break
        case 'remaining_amount':
          aValue = a.remaining_amount || 0
          bValue = b.remaining_amount || 0
          break
        case 'sale_date':
          aValue = new Date(a.sale_date || 0)
          bValue = new Date(b.sale_date || 0)
          break
        default:
          aValue = a[key] || ''
          bValue = b[key] || ''
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
    
    setAllSales(sortedAllSales)
    
    // Update displayed sales
    if (searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) {
      setSales(sortedAllSales.filter(sale => matchesFilters(sale)))
    } else {
      setSales(sortedAllSales.slice(0, visibleSalesCount))
    }
  }

  // Function to check if sale matches all filters
  const matchesFilters = (sale) => {
    const searchTermStr = searchTerm.trim()
    
    // If search term is empty, return true for search match
    if (!searchTermStr) {
      // Check other filters only
      const remaining = sale.remaining_amount || 0
      const paid = sale.paid_amount || 0
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'paid' && remaining === 0 && paid > 0) ||
        (statusFilter === 'partial' && paid > 0 && remaining > 0) ||
        (statusFilter === 'unpaid' && paid === 0)

      const matchesClient = clientFilter === 'all' || sale.client?.id?.toString() === clientFilter

      // Filtre par date
      let matchesDate = true
      if (dateFrom || dateTo) {
        const saleDate = sale.sale_date ? new Date(sale.sale_date) : null
        
        if (dateFrom && saleDate) {
          const fromDate = new Date(dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          if (saleDate < fromDate) {
            matchesDate = false
          }
        }
        
        if (dateTo && saleDate) {
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (saleDate > toDate) {
            matchesDate = false
          }
        }
      }

      return matchesStatus && matchesClient && matchesDate
    }
    
    // Case-insensitive search by real ID, documentId, and other fields
    const matchesSearch = 
      sale.id?.toString().toLowerCase().includes(searchTermStr.toLowerCase()) ||
      (sale.documentId && sale.documentId.toLowerCase().includes(searchTermStr.toLowerCase())) ||
      (sale.client?.name && sale.client.name.toLowerCase().includes(searchTermStr.toLowerCase())) ||
      (sale.user?.username && sale.user.username.toLowerCase().includes(searchTermStr.toLowerCase())) ||
      (sale.client?.email && sale.client.email.toLowerCase().includes(searchTermStr.toLowerCase()))

    const remaining = sale.remaining_amount || 0
    const paid = sale.paid_amount || 0
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && remaining === 0 && paid > 0) ||
      (statusFilter === 'partial' && paid > 0 && remaining > 0) ||
      (statusFilter === 'unpaid' && paid === 0)

    const matchesClient = clientFilter === 'all' || sale.client?.id?.toString() === clientFilter

    // Filtre par date
    let matchesDate = true
    if (dateFrom || dateTo) {
      const saleDate = sale.sale_date ? new Date(sale.sale_date) : null
      
      if (dateFrom && saleDate) {
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        if (saleDate < fromDate) {
          matchesDate = false
        }
      }
      
      if (dateTo && saleDate) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (saleDate > toDate) {
          matchesDate = false
        }
      }
    }

    return matchesSearch && matchesStatus && matchesClient && matchesDate
  }

  // Function to load more sales
  const loadMoreSales = () => {
    const newCount = visibleSalesCount + 25
    setVisibleSalesCount(newCount)
    
    if (searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) {
      setSales(allSales.filter(sale => matchesFilters(sale)).slice(0, newCount))
    } else {
      setSales(allSales.slice(0, newCount))
    }
  }

  // Function to show all sales
  const showAllSales = () => {
    setVisibleSalesCount(allSales.length)
    
    if (searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) {
      setSales(allSales.filter(sale => matchesFilters(sale)))
    } else {
      setSales(allSales)
    }
    setExpanded(true)
  }

  // Function to collapse to default view
  const collapseSales = () => {
    setVisibleSalesCount(25)
    
    if (searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) {
      setSales(allSales.filter(sale => matchesFilters(sale)).slice(0, 25))
    } else {
      setSales(allSales.slice(0, 25))
    }
    setExpanded(false)
  }

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && data.data) {
        setClients(data.data)
      } else {
        console.error('Structure de données clients inattendue:', data)
        setClients([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error)
      setClients([])
    }
  }

  // Fonction d'export PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // En-tête du document
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text('RAPPORT DES VENTES', 105, 15, { align: 'center' })
      
      // Informations de base
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 25)
      doc.text(`Total des ventes: ${allSales.length}`, 14, 30)
      doc.text(`Période: ${getDateRangeText()}`, 14, 35)
      
      // Préparer les données du tableau
      const tableData = allSales.map(sale => [
        `#${sale.id}`,
        sale.documentId || 'N/A', // Include documentId in export
        sale.client?.name || 'N/A',
        sale.user?.username || 'N/A',
        `${(sale.total_amount || 0).toFixed(2)} DH`,
        `${(sale.paid_amount || 0).toFixed(2)} DH`,
        `${(sale.remaining_amount || 0).toFixed(2)} DH`,
        sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('fr-FR') : 'N/A',
        getStatusText(sale)
      ])
      
      // En-têtes du tableau
      const headers = [
        'ID Vente',
        'Document ID', // Add documentId header
        'Client',
        'Vendeur',
        'Total',
        'Payé',
        'Reste',
        'Date',
        'Statut'
      ]
      
      // Créer le tableau
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 45,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 45 }
      })
      
      // Statistiques en bas
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.text('STATISTIQUES', 14, finalY)
      
      doc.setFontSize(10)
      const totalRevenue = allSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const totalPaid = allSales.reduce((sum, sale) => sum + (sale.paid_amount || 0), 0)
      const totalRemaining = allSales.reduce((sum, sale) => sum + (sale.remaining_amount || 0), 0)
      
      doc.text(`Chiffre d'affaires total: ${totalRevenue.toFixed(2)} DH`, 14, finalY + 8)
      doc.text(`Total payé: ${totalPaid.toFixed(2)} DH`, 14, finalY + 16)
      doc.text(`Total restant: ${totalRemaining.toFixed(2)} DH`, 14, finalY + 24)
      
      // Pied de page
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Document généré par le système de gestion des ventes', 105, 280, { align: 'center' })
      
      // Sauvegarder le PDF
      doc.save(`ventes_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
      alert('Erreur lors de l\'export PDF')
    }
  }

  // Fonction d'export CSV
  const exportToCSV = () => {
    try {
      // En-têtes CSV
      const headers = [
        'ID Vente',
        'Document ID', // Add documentId header
        'Client',
        'Téléphone Client',
        'Vendeur',
        'Total (DH)',
        'Payé (DH)',
        'Reste (DH)',
        'Date',
        'Statut',
        'Nombre d\'articles'
      ]
      
      // Données CSV
      const csvData = allSales.map(sale => [
        sale.id,
        sale.documentId || 'N/A', // Include documentId in CSV
        sale.client?.name || 'N/A',
        sale.client?.phone || 'N/A',
        sale.user?.username || 'N/A',
        (sale.total_amount || 0).toFixed(2),
        (sale.paid_amount || 0).toFixed(2),
        (sale.remaining_amount || 0).toFixed(2),
        sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('fr-FR') : 'N/A',
        getStatusText(sale),
        sale.sale_items?.length || 0
      ])
      
      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')
      
      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `ventes_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error)
      alert('Erreur lors de l\'export CSV')
    }
  }

  // Fonction utilitaire pour obtenir le texte du statut
  const getStatusText = (sale) => {
    const remaining = sale.remaining_amount || 0
    const paid = sale.paid_amount || 0
    
    if (remaining === 0 && paid > 0) {
      return 'Payée'
    } else if (paid > 0 && remaining > 0) {
      return 'Partiellement payée'
    } else {
      return 'Impayée'
    }
  }

  // Fonction utilitaire pour obtenir le texte de la plage de dates
  const getDateRangeText = () => {
    if (dateFrom && dateTo) {
      return `Du ${new Date(dateFrom).toLocaleDateString('fr-FR')} au ${new Date(dateTo).toLocaleDateString('fr-FR')}`
    } else if (dateFrom) {
      return `À partir du ${new Date(dateFrom).toLocaleDateString('fr-FR')}`
    } else if (dateTo) {
      return `Jusqu'au ${new Date(dateTo).toLocaleDateString('fr-FR')}`
    } else {
      return 'Toute période'
    }
  }

  // Fonction pour réinitialiser les filtres de date
  const resetDateFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  const deleteSale = async (sale) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/sales/${sale.documentId || sale.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      fetchAllSales()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la vente')
    }
  }

  const getStatusBadge = (sale) => {
    const remaining = sale.remaining_amount || 0
    const paid = sale.paid_amount || 0
    
    if (remaining === 0 && paid > 0) {
      return <Badge variant="ghost">Payée</Badge>
    } else if (paid > 0 && remaining > 0) {
      return <Badge variant="default">Partiellement payée</Badge>
    } else {
      return <Badge variant="destructive" className="text-white">Impayée</Badge>
    }
  }

  const handleViewDetails = (sale) => {
    setSelectedSale(sale)
    setIsDetailsDialogOpen(true)
  }

  const handleEdit = (sale) => {
    setSelectedSale(sale)
    setIsEditDialogOpen(true)
  }

  const handleSaleSuccess = () => {
    setIsCreatingSale(false)
    fetchAllSales()
  }

  const handleSaleCancel = () => {
    setIsCreatingSale(false)
  }

  // Enhanced search functionality
  const filteredSales = allSales.filter(sale => matchesFilters(sale))

  // Update sales display when filters change
  useEffect(() => {
    if (searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) {
      // When searching/filtering, show all matching results
      setSales(filteredSales)
      setExpanded(true)
    } else {
      // When no filters, show paginated view
      setSales(allSales.slice(0, visibleSalesCount))
      setExpanded(visibleSalesCount >= allSales.length)
    }
  }, [searchTerm, statusFilter, clientFilter, dateFrom, dateTo, visibleSalesCount, allSales])

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUpDown className="h-3 w-3 ml-1 rotate-180" />
      : <ArrowUpDown className="h-3 w-3 ml-1" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement des ventes...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isCreatingSale) {
    return (
      <div className="min-h-screen bg-background">
        <div className=" md:p-6">
          <div className="max-w-7xl mx-auto dark:text-white">
            <CreateSaleDialog 
              onSuccess={handleSaleSuccess}
              onCancel={handleSaleCancel}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Ventes
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Gestion des ventes et point de vente (POS)
            </p>
          </div>

          <Button 
            size="lg" 
            className="gap-2 text-sm md:text-base"
            onClick={() => setIsCreatingSale(true)}
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            Nouvelle Vente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Ventes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{allSales.length}</div>
              <p className="text-xs text-muted-foreground">Ventes totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Chiffre d'Affaires</CardTitle>
              <span className="text-muted-foreground text-xs">DH</span>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {allSales.reduce((total, sale) => total + (sale.total_amount || 0), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total encaissé</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">En Attente</CardTitle>
              <Badge variant="text-muted-foreground text-xs" className="text-xs">DH</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-destructive">
                {allSales.reduce((total, sale) => total + (sale.remaining_amount || 0), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Montant impayé</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Taux Paiement</CardTitle>
              <Badge variant="default" className="text-xs">%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {allSales.length > 0 
                  ? ((allSales.reduce((total, sale) => total + (sale.paid_amount || 0), 0) / 
                      Math.max(allSales.reduce((total, sale) => total + (sale.total_amount || 0), 0), 1)) * 100).toFixed(1)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">Taux de recouvrement</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ID, documentId, client, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background text-sm md:text-base"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background text-sm md:text-base">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm md:text-base">Tous les statuts</SelectItem>
                  <SelectItem value="paid" className="text-sm md:text-base">Payée</SelectItem>
                  <SelectItem value="partial" className="text-sm md:text-base">Partiellement payée</SelectItem>
                  <SelectItem value="unpaid" className="text-sm md:text-base ">Impayée</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="bg-background text-sm md:text-base">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tous clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm md:text-base">Tous les clients</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()} className="text-sm md:text-base">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtres de date */}
              <div className="space-y-2 ">
                <Label htmlFor="dateFrom" className="text-xs">De</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-background text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-xs">À</Label>
                <div className="flex gap-2">
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-background text-sm md:text-base flex-1"
                  />
                  {(dateFrom || dateTo) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetDateFilters}
                      className="h-10 px-2"
                      title="Réinitialiser les dates"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Historique des Ventes</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {sales.length} vente(s) affichée(s) sur {allSales.length} au total
                  {(searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) && (
                    <span className="ml-2 text-primary">
                      • {filteredSales.length} résultat(s) trouvé(s)
                    </span>
                  )}
                  {(dateFrom || dateTo) && (
                    <span className="ml-2 text-primary">
                      • {getDateRangeText()}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 text-sm md:text-base">
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={exportToPDF} className="text-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToCSV} className="text-sm">
                      <TableIcon className="h-4 w-4 mr-2" />
                      Exporter en CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!expanded && visibleSalesCount < allSales.length && (
                  <Button 
                    variant="outline" 
                    onClick={showAllSales}
                    className="gap-2 text-sm md:text-base"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Tout afficher
                  </Button>
                )}
                {expanded && (
                  <Button 
                    variant="outline" 
                    onClick={collapseSales}
                    className="gap-2 text-sm md:text-base"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Réduire
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('id')}
                    >
                      <div className="flex items-center">
                        ID Vente
                        <SortIndicator columnKey="id" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('documentId')}
                    >
                      <div className="flex items-center">
                        Document ID
                        <SortIndicator columnKey="documentId" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('client')}
                    >
                      <div className="flex items-center">
                        Client
                        <SortIndicator columnKey="client" />
                      </div>
                    </TableHead>
                    <TableHead className="text-xs md:text-sm">Vendeur</TableHead>
                    <TableHead 
                      className="text-right text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('total_amount')}
                    >
                      <div className="flex items-center justify-end">
                        Total
                        <SortIndicator columnKey="total_amount" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('paid_amount')}
                    >
                      <div className="flex items-center justify-end">
                        Payé
                        <SortIndicator columnKey="paid_amount" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('remaining_amount')}
                    >
                      <div className="flex items-center justify-end">
                        Reste
                        <SortIndicator columnKey="remaining_amount" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-muted"
                      onClick={() => sortSales('sale_date')}
                    >
                      <div className="flex items-center">
                        Date
                        <SortIndicator columnKey="sale_date" />
                      </div>
                    </TableHead>
                    <TableHead className="text-xs md:text-sm">Statut</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="font-semibold text-xs md:text-sm">#{sale.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {sale.sale_items?.length || 0} article(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs md:text-sm font-mono">
                          {sale.documentId || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <div>
                            <span className="text-xs md:text-sm">{sale.client?.name || 'Client non spécifié'}</span>
                            {sale.client?.phone && (
                              <div className="text-xs text-muted-foreground">
                                {sale.client.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {sale.user?.username || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs md:text-sm">
                        {sale.total_amount ? `${sale.total_amount.toFixed(2)} DH` : '0.00 DH'}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold text-xs md:text-sm">
                        {sale.paid_amount ? `${sale.paid_amount.toFixed(2)} DH` : '0.00 DH'}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-semibold text-xs md:text-sm">
                        {sale.remaining_amount ? `${sale.remaining_amount.toFixed(2)} DH` : '0.00 DH'}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs md:text-sm">
                          {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sale.sale_date ? new Date(sale.sale_date).toLocaleTimeString('fr-FR') : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sale)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 md:w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(sale)} className="text-xs md:text-sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(sale)} className="text-xs md:text-sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteSale(sale)}
                              className="text-destructive focus:text-destructive text-xs md:text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sales.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  Aucune vente trouvée
                </h3>
                <p className="text-muted-foreground mb-4 md:mb-6 max-w-sm mx-auto text-sm md:text-base">
                  {searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo
                    ? 'Aucune vente ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre première vente.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all' || clientFilter !== 'all' || dateFrom || dateTo) ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setClientFilter('all')
                      setDateFrom('')
                      setDateTo('')
                    }}
                    className="text-sm md:text-base"
                  >
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Button onClick={() => setIsCreatingSale(true)} className="text-sm md:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une vente
                  </Button>
                )}
              </div>
            )}

            {/* Load More Button */}
            {!expanded && visibleSalesCount < allSales.length && sales.length > 0 && (
              <div className="border-t p-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMoreSales}
                  className="mx-auto"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Charger plus ({Math.min(25, allSales.length - visibleSalesCount)} de plus)
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Affichage de {visibleSalesCount} sur {allSales.length} ventes
                </p>
              </div>
            )}

            {/* Show All Info */}
            {expanded && sales.length > 0 && (
              <div className="border-t p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Affichage de toutes les {sales.length} ventes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <SaleDetailsDialog
          sale={selectedSale}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />

        <EditSaleDialog
          sale={selectedSale}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => {
            setIsEditDialogOpen(false)
            fetchAllSales()
          }}
        />
      </div>
    </div>
  )
}