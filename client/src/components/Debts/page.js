
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Download,
  User,
  Calendar,
  CreditCard,
  FileText,
  ChevronDown,
  ChevronRight,
  Edit,
  Printer,
  HandCoins,
  ShoppingCart,
  CheckCircle
} from 'lucide-react'
import AddCreditDialog from './components/add-credit-dialog'
import CreditDetailsDialog from './components/credit-details-dialog'
import PrintInvoice from '../Sales/components/print-invoice'
import PaymentDialog from './components/payment-dialog'
import SaleDetailsDialog from '../Sales/components/sale-details-dialog'
import { exportCreditsToPDF } from '@/lib/exportPdf'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function CreditsPage() {
  const [credits, setCredits] = useState([])
  const [sales, setSales] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCreditDetailsDialogOpen, setIsCreditDetailsDialogOpen] = useState(false)
  const [isSaleDetailsDialogOpen, setIsSaleDetailsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState(null)
  const [selectedSale, setSelectedSale] = useState(null)
  const [expandedClients, setExpandedClients] = useState(new Set())
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [saleToPrint, setSaleToPrint] = useState(null)
  const [markAsPaidDialog, setMarkAsPaidDialog] = useState({
    open: false,
    item: null,
    type: null // 'credit' or 'sale'
  })

  useEffect(() => {
    fetchCredits()
    fetchSales()
    fetchClients()
  }, [])

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/api/credits?populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
    
      if (data && data.data) {
        setCredits(data.data)
      } else {
        console.error('Structure de données inattendue:', data)
        setCredits([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des crédits:', error)
      setCredits([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/api/sales?populate=*&filters[remaining_amount][$gt]=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
      
      if (data && data.data) {
        setSales(data.data)
      } else {
        setSales([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error)
      setSales([])
    }
  }

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data && data.data) {
        setClients(data.data)
      } else {
        setClients([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error)
      setClients([])
    }
  }

  const toggleClientExpansion = (clientId) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId)
    } else {
      newExpanded.add(clientId)
    }
    setExpandedClients(newExpanded)
  }

  const getCreditStatusBadge = (credit) => {
    const remaining = credit.amount - (credit.paid_amount || 0)
    
    if (remaining <= 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Clôturé</Badge>
    } else if (credit.statut === 'active') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Actif</Badge>
    } else {
      return <Badge variant="destructive">Impayé</Badge>
    }
  }

  const getSaleStatusBadge = (sale) => {
    const remaining = sale.remaining_amount || 0
    const paid = sale.paid_amount || 0
    
    if (remaining === 0 && paid > 0) {
      return <Badge variant="default">Payée</Badge>
    } else if (paid > 0 && remaining > 0) {
      return <Badge variant="secondary">Partiellement payée</Badge>
    } else {
      return <Badge variant="destructive">Impayée</Badge>
    }
  }

  const handleViewCreditDetails = (credit) => {
    setSelectedCredit(credit)
    setIsCreditDetailsDialogOpen(true)
  }

  const handleViewSaleDetails = (sale) => {
    setSelectedSale(sale)
    setIsSaleDetailsDialogOpen(true)
  }

  const handlePrintInvoice = (sale) => {
    setSaleToPrint(sale)
    setShowPrintDialog(true)
  }

  const handleAddPayment = (debt, type) => {
    if (type === 'credit') {
      setSelectedCredit({
        ...debt,
        isClientPayment: false,
        type: 'credit'
      })
    } else {
      setSelectedCredit({
        id: debt.id,
        type: 'sale',
        amount: debt.total_amount || 0,
        paid_amount: debt.paid_amount || 0,
        remaining_amount: debt.remaining_amount || 0,
        client: debt.client,
        sale: debt,
        isClientPayment: false
      })
    }
    setIsPaymentDialogOpen(true)
  }

  const handleMarkAsPaid = (item, type) => {
    setMarkAsPaidDialog({
      open: true,
      item: item,
      type: type
    })
  }

  const confirmMarkAsPaid = async () => {
    const { item, type } = markAsPaidDialog
    if (!item) return

    try {
      const token = localStorage.getItem('token')
      
      if (type === 'credit') {
        const remainingAmount = item.amount - (item.paid_amount || 0)
        
        // Update credit
        const updateResponse = await fetch(`${API_URL}/api/credits/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              paid_amount: item.amount,
              statut: 'closed'
            }
          })
        })

        if (!updateResponse.ok) {
          throw new Error('Erreur lors de la mise à jour du crédit')
        }

        // Create payment history
        if (remainingAmount > 0) {
          await fetch(`${API_URL}/api/payment-histories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              data: {
                amount: remainingAmount,
                payment_method: 'cash',
                payment_date: new Date().toISOString(),
                note: 'Ce paiement a été effectué automatiquement',
                credit: item.documentId || item.id
              }
            })
          })
        }

      } else if (type === 'sale') {
        const remainingAmount = item.remaining_amount || 0
        
        // Update sale
        const updateResponse = await fetch(`${API_URL}/api/sales/${item.documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              paid_amount: item.total_amount,
              remaining_amount: 0
            }
          })
        })

        if (!updateResponse.ok) {
          throw new Error('Erreur lors de la mise à jour de la vente')
        }

        // Create payment history
        if (remainingAmount > 0) {
          await fetch(`${API_URL}/api/payment-histories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              data: {
                amount: remainingAmount,
                
                payment_date: new Date().toISOString(),
                note: 'Ce paiement a été effectué automatiquement',
                sale: item.documentId || item.id
              }
            })
          })
        }
      }

      toast.success('Paiement complet enregistré avec succès!')
      setMarkAsPaidDialog({ open: false, item: null, type: null })
      
      // Refresh data
      fetchCredits()
      fetchSales()
      
    } catch (error) {
      console.error('Erreur lors du marquage comme payé:', error)
      toast.error('Erreur lors du marquage comme payé')
    }
  }

  // Filtrer les crédits par date
  const filterDebtsByDate = (debtsList) => {
    const now = new Date()
    
    switch (dateFilter) {
      case 'today':
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return debtsList.filter(debt => {
          const debtDate = new Date(debt.createdAt || debt.sale_date)
          debtDate.setHours(0, 0, 0, 0)
          return debtDate.getTime() === today.getTime()
        })
      
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return debtsList.filter(debt => new Date(debt.createdAt || debt.sale_date) >= startOfMonth)
      
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return debtsList.filter(debt => new Date(debt.createdAt || debt.sale_date) >= startOfYear)
      
      default:
        return debtsList
    }
  }

  // Regrouper les dettes par client (crédits + ventes impayées)
  const getClientDebts = () => {
    const clientDebts = {}
    
    // Ajouter les crédits
    credits.forEach(credit => {
      const client = credit.client
      if (!client) return
      
      const clientId = client.id
      if (!clientDebts[clientId]) {
        clientDebts[clientId] = {
          client: client,
          credits: [],
          sales: []
        }
      }
      clientDebts[clientId].credits.push(credit)
    })
    
    // Ajouter les ventes impayées
    sales.forEach(sale => {
      const client = sale.client
      if (!client) return
      
      const clientId = client.id
      if (!clientDebts[clientId]) {
        clientDebts[clientId] = {
          client: client,
          credits: [],
          sales: []
        }
      }
      clientDebts[clientId].sales.push(sale)
    })
    
    return clientDebts
  }

  // Calculer les totaux par client
  const getClientTotals = () => {
    const clientDebts = getClientDebts()
    
    return Object.keys(clientDebts).map(clientId => {
      const clientData = clientDebts[clientId]
      
      // Calculer à partir des crédits
      const creditDebt = clientData.credits.reduce((sum, credit) => sum + credit.amount, 0)
      const creditPaid = clientData.credits.reduce((sum, credit) => sum + (credit.paid_amount || 0), 0)
      const creditRemaining = creditDebt - creditPaid

      // Calculer à partir des ventes
      const saleDebt = clientData.sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const salePaid = clientData.sales.reduce((sum, sale) => sum + (sale.paid_amount || 0), 0)
      const saleRemaining = clientData.sales.reduce((sum, sale) => sum + (sale.remaining_amount || 0), 0)

      // Totaux combinés
      const totalDebt = creditDebt + saleDebt
      const totalPaid = creditPaid + salePaid
      const remainingDebt = creditRemaining + saleRemaining

      return {
        client: clientData.client,
        totalDebt,
        totalPaid,
        remainingDebt,
        credits: clientData.credits,
        sales: clientData.sales
      }
    })
  }

  // Filtrer les clients
  const filteredClients = getClientTotals().filter(clientTotal => {
    const matchesSearch = 
      clientTotal.client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientTotal.client.phone?.includes(searchTerm)

    const remaining = clientTotal.remainingDebt
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && remaining > 0) ||
      (statusFilter === 'closed' && remaining <= 0)

    // Appliquer le filtre de date sur les dettes du client
    const filteredCredits = filterDebtsByDate(clientTotal.credits)
    const filteredSales = filterDebtsByDate(clientTotal.sales)
    const hasDebtsAfterDateFilter = filteredCredits.length > 0 || filteredSales.length > 0

    return matchesSearch && matchesStatus && (dateFilter === 'all' || hasDebtsAfterDateFilter)
  })

  const handleExportToPDF = () => {
    try {
      exportCreditsToPDF(filteredClients)
      toast.success('Export PDF généré avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
      toast.error('Erreur lors de l\'export PDF')
    }
  }

  const exportToCSV = () => {
    try {
      const csvContent = filteredClients.map(client => 
        `${client.client.name},${client.client.phone},${client.totalDebt},${client.totalPaid},${client.remainingDebt}`
      ).join('\n')
      
      const blob = new Blob([`Client,Téléphone,Dette Totale,Payé,Reste\n${csvContent}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dettes_clients_export.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export CSV généré avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error)
      toast.error('Erreur lors de l\'export CSV')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement des dettes...</span>
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
              Gestion des Dettes Clients
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Suivi des crédits et ventes impayées
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 text-sm md:text-base">
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                Nouveau Crédit
              </Button>
            </DialogTrigger> 
            <DialogContent className="w-full max-w-[95vw] h-[85vh] overflow-y-auto dark:text-white text-sm">
              <DialogHeader>
                <DialogTitle className="dark:text-white text-lg md:text-xl">Nouveau Crédit</DialogTitle>
                <DialogDescription className="text-sm md:text-base">
                  Créez un nouveau crédit pour un client
                </DialogDescription>
              </DialogHeader>
              <AddCreditDialog 
                onSuccess={() => {
                  setIsAddDialogOpen(false)
                  fetchCredits()
                }}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 ">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Clients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{filteredClients.length}</div>
              <p className="text-xs text-muted-foreground">Clients endettés</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Dette Totale</CardTitle>
              <span className="text-muted-foreground text-xs">DH</span>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {filteredClients.reduce((total, client) => total + client.totalDebt, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Montant total dû</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Montant Récupéré</CardTitle>
              <Badge variant="default" className="text-xs">DH</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {filteredClients.reduce((total, client) => total + client.totalPaid, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total recouvré</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Reste à Récupérer</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {filteredClients.reduce((total, client) => total + client.remainingDebt, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">En attente de paiement</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3 dark:text-white">
            <CardTitle className="text-lg md:text-xl">Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background text-sm md:text-base"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background text-sm md:text-base">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut dette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="closed">Clôturé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-background text-sm md:text-base">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute période</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3 dark:text-white">
          <Button variant="outline" onClick={handleExportToPDF} className="gap-2 text-sm md:text-base">
            <FileText className="h-4 w-4" />
            Exporter PDF
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="gap-2 text-sm md:text-base">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Debts Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Dettes Clients</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {filteredClients.length} client(s) trouvé(s) avec des dettes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px] text-xs md:text-sm"></TableHead>
                    <TableHead className="text-xs md:text-sm">Client</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Dette Totale</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Payé</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Reste Dû</TableHead>
                    <TableHead className="text-xs md:text-sm">Statut</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((clientTotal) => (
                    <React.Fragment key={clientTotal.client.id}>
                      {/* Ligne Client Principal */}
                      <TableRow className="group hover:bg-muted/50 transition-colors bg-muted/30">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleClientExpansion(clientTotal.client.id)}
                            className="h-8 w-8 p-0"
                          >
                            {expandedClients.has(clientTotal.client.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-semibold text-sm md:text-base">{clientTotal.client.name}</div>
                              <div className="text-xs text-muted-foreground">{clientTotal.client.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm md:text-base text-red-600">
                          {clientTotal.totalDebt.toFixed(2)} DH
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm md:text-base text-green-600">
                          {clientTotal.totalPaid.toFixed(2)} DH
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm md:text-base text-orange-600">
                          {clientTotal.remainingDebt.toFixed(2)} DH
                        </TableCell>
                        <TableCell>
                          {clientTotal.remainingDebt > 0 ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">Actif</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800">Clôturé</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {/* No global payment button - only expand/collapse */}
                        </TableCell>
                      </TableRow>

                      {/* Lignes des Crédits Détaillés */}
                      {expandedClients.has(clientTotal.client.id) && clientTotal.credits.map((credit) => {
                        const creditRemaining = credit.amount - (credit.paid_amount || 0)
                        return (
                          <TableRow key={`credit-${credit.id}`} className="bg-muted/10 hover:bg-muted/20 transition-colors">
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="pl-6 text-sm md:text-base">
                                <div className="font-medium flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Crédit Direct #{credit.id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {credit.due_date ? `Échéance: ${new Date(credit.due_date).toLocaleDateString('fr-FR')}` : 'Pas de date d\'échéance'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm md:text-base">
                              {credit.amount.toFixed(2)} DH
                            </TableCell>
                            <TableCell className="text-right text-sm md:text-base text-green-600">
                              {(credit.paid_amount || 0).toFixed(2)} DH
                            </TableCell>
                            <TableCell className="text-right text-sm md:text-base text-orange-600 font-semibold">
                              {creditRemaining.toFixed(2)} DH
                            </TableCell>
                            <TableCell>
                              {getCreditStatusBadge(credit)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewCreditDetails(credit)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddPayment(credit, 'credit')}
                                  className="h-8 w-8 p-0 text-green-600"
                                  disabled={creditRemaining <= 0}
                                >
                                  <HandCoins className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(credit, 'credit')}
                                  className="h-8 w-8 p-0 text-blue-600"
                                  disabled={creditRemaining <= 0}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}

                      {/* Lignes des Ventes Détaillées */}
                      {expandedClients.has(clientTotal.client.id) && clientTotal.sales.map((sale) => {
                        const saleRemaining = sale.remaining_amount || 0
                        return (
                          <TableRow key={`sale-${sale.id}`} className="bg-muted/10 hover:bg-muted/20 transition-colors">
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="pl-6 text-sm md:text-base">
                                <div className="font-medium flex items-center gap-2">
                                  <ShoppingCart className="h-4 w-4" />
                                  Vente #{sale.id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {sale.sale_date ? `Date: ${new Date(sale.sale_date).toLocaleDateString('fr-FR')}` : 'Pas de date'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm md:text-base">
                              {sale.total_amount?.toFixed(2) || '0.00'} DH
                            </TableCell>
                            <TableCell className="text-right text-sm md:text-base text-green-600">
                              {(sale.paid_amount || 0).toFixed(2)} DH
                            </TableCell>
                            <TableCell className="text-right text-sm md:text-base text-orange-600 font-semibold">
                              {saleRemaining.toFixed(2)} DH
                            </TableCell>
                            <TableCell>
                              {getSaleStatusBadge(sale)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewSaleDetails(sale)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddPayment(sale, 'sale')}
                                  className="h-8 w-8 p-0 text-green-600"
                                  disabled={saleRemaining <= 0}
                                >
                                  <HandCoins className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(sale, 'sale')}
                                  className="h-8 w-8 p-0 text-blue-600"
                                  disabled={saleRemaining <= 0}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePrintInvoice(sale)}
                                  className="h-8 w-8 p-0 text-blue-600"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <CreditCard className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  Aucune dette trouvée
                </h3>
                <p className="text-muted-foreground mb-4 md:mb-6 max-w-sm mx-auto text-sm md:text-base">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Aucune dette ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre premier crédit.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setDateFilter('all')
                    }}
                    className="text-sm md:text-base"
                  >
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="text-sm md:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un crédit
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreditDetailsDialog
          credit={selectedCredit}
          open={isCreditDetailsDialogOpen}
          onOpenChange={setIsCreditDetailsDialogOpen}
        />

        <SaleDetailsDialog
          sale={selectedSale}
          open={isSaleDetailsDialogOpen}
          onOpenChange={setIsSaleDetailsDialogOpen}
        />

        <PaymentDialog
          credit={selectedCredit}
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          onSuccess={() => {
            setIsPaymentDialogOpen(false)
            fetchCredits()
            fetchSales()
          }}
        />

        {/* Dialog de confirmation pour marquer comme payé */}
        <Dialog open={markAsPaidDialog.open} onOpenChange={(open) => setMarkAsPaidDialog({...markAsPaidDialog, open})}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 dark:text-white text-lg md:text-xl">
                <CheckCircle className="h-5 w-5 text-green-600 " />
                Confirmer le paiement complet
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir marquer cette {markAsPaidDialog.type === 'credit' ? 'crédit' : 'vente'} comme entièrement payée ?
              </DialogDescription>
            </DialogHeader>
            
            {markAsPaidDialog.item && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Client:</span>
                      <span>{markAsPaidDialog.item.client?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{markAsPaidDialog.type === 'credit' ? 'Crédit' : 'Vente'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Montant total:</span>
                      <span className="font-semibold">
                        {markAsPaidDialog.type === 'credit' 
                          ? markAsPaidDialog.item.amount?.toFixed(2) 
                          : markAsPaidDialog.item.total_amount?.toFixed(2)
                        } DH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Déjà payé:</span>
                      <span className="text-green-600">
                        {markAsPaidDialog.type === 'credit' 
                          ? (markAsPaidDialog.item.paid_amount || 0).toFixed(2)
                          : (markAsPaidDialog.item.paid_amount || 0).toFixed(2)
                        } DH
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Reste à payer:</span>
                      <span className="font-semibold text-orange-600">
                        {markAsPaidDialog.type === 'credit' 
                          ? (markAsPaidDialog.item.amount - (markAsPaidDialog.item.paid_amount || 0)).toFixed(2)
                          : (markAsPaidDialog.item.remaining_amount || 0).toFixed(2)
                        } DH
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Un paiement automatique sera créé dans l'historique avec la mention "Ce paiement a été effectué automatiquement".
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 dark:text-white">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setMarkAsPaidDialog({open: false, item: null, type: null})}
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                onClick={confirmMarkAsPaid}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmer le paiement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog d'impression */}
        {showPrintDialog && saleToPrint && (
          <PrintInvoice 
            sale={saleToPrint} 
            onClose={() => setShowPrintDialog(false)}
          />
        )}
      </div>
    </div>
  )
}
