
"use client"
import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  BookOpen,
  Video,
  FileText,
  Sparkles,
  Clock,
  User,
  ShoppingCart,
  Package,
  CreditCard,
  Settings
} from 'lucide-react'

export default function AssistanceAccordion() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openCategories, setOpenCategories] = useState(new Set(['general']))
  const [openQuestions, setOpenQuestions] = useState(new Set())

  // Données des FAQ organisées par catégorie
  const faqData = [
    {
      id: 'general',
      title: 'Questions Générales',
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          id: 1,
          question: "Comment créer une nouvelle vente ?",
          answer: "Pour créer une nouvelle vente :\n\n1. Allez dans la section 'Ventes'\n2. Cliquez sur 'Nouvelle Vente'\n3. Sélectionnez le client\n4. Ajoutez les produits au panier\n5. Choisissez le mode de paiement\n6. Confirmez la vente",
          steps: 6,
          time: '2 min'
        },
        {
          id: 2,
          question: "Comment gérer les stocks ?",
          answer: "La gestion des stocks se fait automatiquement lors des ventes. Vous pouvez aussi :\n\n• Ajouter manuellement des produits\n• Modifier les quantités en stock\n• Consulter l'historique des mouvements\n• Configurer les alertes de stock faible",
          steps: 4,
          time: '3 min'
        },
        {
          id: 3,
          question: "Comment suivre les paiements clients ?",
          answer: "Utilisez la section 'Crédits' pour :\n\n• Voir toutes les dettes en cours\n• Enregistrer de nouveaux paiements\n• Consulter l'historique complet\n• Générer des rapports de recouvrement",
          steps: 4,
          time: '2 min'
        }
      ]
    },
    {
      id: 'sales',
      title: 'Ventes & Facturation',
      icon: <ShoppingCart className="h-5 w-5" />,
      questions: [
        {
          id: 4,
          question: "Comment modifier une vente existante ?",
          answer: "Les ventes validées ne peuvent pas être modifiées pour garantir l'intégrité des données. Si nécessaire :\n\n1. Créez une vente d'annulation\n2. Recréez la vente correcte\n3. Documentez la raison de la modification",
          steps: 3,
          time: '5 min'
        },
        {
          id: 5,
          question: "Comment imprimer une facture ?",
          answer: "Pour imprimer une facture :\n\n1. Allez dans la liste des ventes\n2. Trouvez la vente souhaitée\n3. Cliquez sur l'icône imprimante\n4. Le PDF se génère automatiquement\n5. Imprimez ou enregistrez le fichier",
          steps: 5,
          time: '1 min'
        }
      ]
    },
    {
      id: 'products',
      title: 'Gestion des Produits',
      icon: <Package className="h-5 w-5" />,
      questions: [
        {
          id: 6,
          question: "Comment ajouter un nouveau produit ?",
          answer: "Pour ajouter un produit :\n\n1. Section 'Produits' → 'Ajouter Produit'\n2. Renseignez le nom et prix\n3. Définissez la quantité initiale\n4. Choisissez l'unité de mesure\n5. Ajoutez une description (optionnel)\n6. Sauvegardez le produit",
          steps: 6,
          time: '3 min'
        },
        {
          id: 7,
          question: "Comment mettre à jour les prix en masse ?",
          answer: "Utilisez la fonction d'import/export :\n\n1. Exportez la liste des produits\n2. Modifiez les prix dans Excel\n3. Réimportez le fichier mis à jour\n4. Vérifiez les modifications\n5. Confirmez la mise à jour",
          steps: 5,
          time: '5 min'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Support Technique',
      icon: <Settings className="h-5 w-5" />,
      questions: [
        {
          id: 8,
          question: "Comment réinitialiser mon mot de passe ?",
          answer: "Pour réinitialiser votre mot de passe :\n\n1. Cliquez sur 'Mot de passe oublié'\n2. Entrez votre email\n3. Suivez le lien reçu par email\n4. Créez un nouveau mot de passe\n5. Confirmez la modification",
          steps: 5,
          time: '3 min'
        },
        {
          id: 9,
          question: "Comment exporter mes données ?",
          answer: "Exportez vos données depuis chaque section :\n\n• Ventes : PDF, Excel, CSV\n• Produits : Excel, CSV\n• Clients : Excel, CSV\n• Crédits : PDF, Excel\n\nChoisissez la période et le format souhaité.",
          steps: 4,
          time: '2 min'
        }
      ]
    }
  ]

  const toggleCategory = (categoryId) => {
    const newOpenCategories = new Set(openCategories)
    if (newOpenCategories.has(categoryId)) {
      newOpenCategories.delete(categoryId)
    } else {
      newOpenCategories.add(categoryId)
    }
    setOpenCategories(newOpenCategories)
  }

  const toggleQuestion = (questionId) => {
    const newOpenQuestions = new Set(openQuestions)
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId)
    } else {
      newOpenQuestions.add(questionId)
    }
    setOpenQuestions(newOpenQuestions)
  }

  // Filtrer les questions basé sur la recherche
  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 dark:bg-transparent">
      {/* En-tête */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 dark:bg-transparent bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Centre d'Assistance
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">Trouvez rapidement des réponses à vos questions</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative dark:bg-black">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground dark:text-gray-400" />
        <Input
          placeholder="Rechercher une question..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg border-2 focus:border-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-blue-400"
        />
        {searchQuery && (
          <Badge className="absolute right-3 top-3 dark:bg-gray-700 dark:text-gray-300">
            {filteredData.reduce((total, cat) => total + cat.questions.length, 0)} résultats
          </Badge>
        )}
      </div>

      {/* Ressources rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 dark:bg-black">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors dark:border-gray-700 dark:text-gray-300">
          <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm">Tutoriels Vidéo</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors dark:border-gray-700 dark:text-gray-300">
          <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm">Guide Utilisateur</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors dark:border-gray-700 dark:text-gray-300">
          <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="text-sm">Documentation</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors dark:border-gray-700 dark:text-gray-300">
          <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm">Contact Support</span>
        </Button>
      </div>

      {/* Liste des catégories et questions */}
      <div className="space-y-4 dark:bg-black">
        {filteredData.map((category) => (
          <Card key={category.id} className="overflow-hidden border-2 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:shadow-gray-900/20">
            {/* En-tête de catégorie */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg dark:text-white">{category.title}</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    {category.questions.length} question(s)
                  </p>
                </div>
              </div>
              <div className="transform transition-transform duration-300">
                {openCategories.has(category.id) ? (
                  <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </button>

            {/* Contenu de la catégorie (animé) */}
            <div className={`dark:bg-black overflow-hidden transition-all duration-500 ease-in-out ${
              openCategories.has(category.id) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="p-6 pt-0 space-y-3">
                {category.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border rounded-lg overflow-hidden transition-all duration-300 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-400"
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggleQuestion(question.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {question.question}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs gap-1 dark:border-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {question.time}
                            </Badge>
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                              {question.steps} étapes
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="transform transition-transform duration-300 ml-4 flex-shrink-0">
                        {openQuestions.has(question.id) ? (
                          <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        )}
                      </div>
                    </button>

                    {/* Réponse (animée) */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openQuestions.has(question.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-t dark:border-gray-600">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {question.answer.split('\n\n').map((paragraph, idx) => (
                            <div key={idx} className="mb-4 last:mb-0">
                              {paragraph.split('\n').map((line, lineIdx) => {
                                // Vérifier si c'est une étape numérotée
                                const stepMatch = line.match(/^(\d+)\.\s+(.*)/)
                                if (stepMatch) {
                                  return (
                                    <div key={lineIdx} className="flex items-start gap-3 mb-2">
                                      <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold mt-0.5">
                                        {stepMatch[1]}
                                      </div>
                                      <span className="text-gray-700 dark:text-gray-300 flex-1">{stepMatch[2]}</span>
                                    </div>
                                  )
                                }
                                
                                // Vérifier si c'est une puce
                                if (line.startsWith('•')) {
                                  return (
                                    <div key={lineIdx} className="flex items-start gap-3 mb-2">
                                      <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2" />
                                      <span className="text-gray-700 dark:text-gray-300 flex-1">{line.slice(2)}</span>
                                    </div>
                                  )
                                }

                                // Texte normal
                                return (
                                  <p key={lineIdx} className="text-gray-700 dark:text-gray-300 mb-2">
                                    {line}
                                  </p>
                                )
                              })}
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 mt-4 border-t border-blue-200 dark:border-blue-800">
                          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            <ThumbsUp className="h-4 w-4" />
                            Utile
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            <ThumbsDown className="h-4 w-4" />
                            Pas utile
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2 ml-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            <Share2 className="h-4 w-4" />
                            Partager
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {filteredData.length === 0 && (
          <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
            <div className="space-y-4">
              <HelpCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg dark:text-white">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground dark:text-gray-400 mt-2">
                  Essayez de modifier vos termes de recherche ou consultez nos autres ressources.
                </p>
              </div>
              <Button 
                onClick={() => setSearchQuery('')}
                variant="outline"
                className="mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Effacer la recherche
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Pied de page */}
     
    </div>
  )
}

// Composants d'icônes supplémentaires
const ThumbsUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
)

const ThumbsDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m-7 0h-2a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
  </svg>
)

const Share2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
)
