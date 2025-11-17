import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportCreditsToPDF = (filteredClients) => {
  try {
    const doc = new jsPDF()

    // Titre
    doc.setFontSize(20)
    doc.text('Rapport des Crédits Clients', 14, 22)

    // Date de génération
    doc.setFontSize(10)
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30)

    // Tableau des clients
    const tableData = filteredClients.map(client => [
      client.client.name,
      client.client.phone || 'N/A',
      `${client.totalDebt.toFixed(2)} DH`,
      `${client.totalPaid.toFixed(2)} DH`,
      `${client.remainingDebt.toFixed(2)} DH`,
      client.remainingDebt > 0 ? 'Actif' : 'Clôturé'
    ])

    // Utilisation de autoTable comme fonction
    autoTable(doc, {
      head: [['Client', 'Téléphone', 'Dette Totale', 'Payé', 'Reste Dû', 'Statut']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 }
      }
    })

    // Statistiques
    const totalDebt = filteredClients.reduce((sum, client) => sum + client.totalDebt, 0)
    const totalPaid = filteredClients.reduce((sum, client) => sum + client.totalPaid, 0)
    const totalRemaining = filteredClients.reduce((sum, client) => sum + client.remainingDebt, 0)

    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Statistiques Totales:', 14, finalY)
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`Dette Totale: ${totalDebt.toFixed(2)} DH`, 14, finalY + 8)
    doc.text(`Total Payé: ${totalPaid.toFixed(2)} DH`, 14, finalY + 16)
    doc.text(`Reste à Payer: ${totalRemaining.toFixed(2)} DH`, 14, finalY + 24)

    // Sauvegarder le PDF
    doc.save(`credits_rapport_${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error)
    throw error
  }
}