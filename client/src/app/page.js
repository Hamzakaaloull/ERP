"use client";

import React, { useState, useRef, lazy, Suspense } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Sun,
  Moon
} from "lucide-react";

// Lazy load Lottie
const DotLottieReact = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((mod) => {
    // Essayer d'utiliser ce qui existe : default ou export commun
    return { default: mod?.default ?? mod?.DotLottieReact ?? mod };
  })
);

// Composant de chargement simple pour Lottie
const LottieFallback = () => (
  <div className="h-24 w-24 bg-gray-200 animate-pulse rounded-lg mx-auto"></div>
);

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const [isOnline, setIsOnline] = useState(true);
  const usernameRef = useRef(null);
  const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  // Effet d'animation et auto-focus
  useEffect(() => {
    // Focus sur l'input username après le montage du composant
    const timer = setTimeout(() => {
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Vérification de l'état du réseau
  useEffect(() => {
    // Définir l'état initial directement
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!isOnline) {
      setError("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password }),
      }); 
      
      const authData = await res.json();
      if (!res.ok) {
        setError(authData.error?.message || "Nom d'utilisateur ou mot de passe invalide.");
        setLoading(false);
        return;
      }
   
      // Sauvegarder le token
      localStorage.setItem("token", authData.jwt);
      localStorage.setItem("userName", authData.user?.username || "non spécifié");

      // Récupérer les données utilisateur
      const userRes = await fetch(`${API}/api/users/me?populate=role`, {
        headers: { Authorization: `Bearer ${authData.jwt}` },
      });
      const userData = await userRes.json();
     
      if (!userRes.ok) {
        setError("Impossible de récupérer les informations de l'utilisateur");
        setLoading(false);
        return;
      }

      const roleName = userData.role?.name;
      
      // Mettre à jour l'état isActive de l'utilisateur à true
      const updateRes = await fetch(`${API}/api/users/${userData.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.jwt}`
        },
        body: JSON.stringify({ 
          isActive: true 
        }),
      });

      if (!updateRes.ok) {
        console.error("Échec de la mise à jour du statut actif de l'utilisateur");
      }

      // Mettre à jour l'état de l'élément actif dans localStorage
      localStorage.setItem("activeComponent", "Utilisateurs");
      localStorage.setItem("sidebarItems", JSON.stringify([
        { title: "Utilisateurs", isActive: true },
        { title: "Stagiaires", isActive: false },
        { title: "Stages", isActive: false },
        { title: "Remarques", isActive: false },
        { title: "Pénalités", isActive: false },
        { title: "Permissions", isActive: false },
        { title: "Consultations", isActive: false },
        { title: "Spécialités", isActive: false }
      ]));

      // Redirection basée sur le rôle
      setTimeout(() => {
        if (roleName === "doctor" || roleName === "admin" || roleName === "public" || roleName === "chef_cellule") {
          router.push("/dashboard");
        } else {
          setError("Accès non autorisé");
          router.push("/");
        }
      }, 0);
      
    } catch (err) {
      setError("Erreur de connexion au serveur.");
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black transition-all duration-500 ease-out">
      {/* Bouton de changement de thème */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-black border border-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors z-10"
        aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
      >
        {theme === "light" ? (
          <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Indicateur de statut réseau */}
      {!isOnline && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-700 text-xs">Hors ligne</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-auto max-w-3xl h-[500px] bg-white dark:bg-black shadow-2xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Carte d'authentification */}
        <div className="w-full lg:w-[380px] p-6 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="flex justify-center item-center">
              <Suspense fallback={<LottieFallback />}>
                <DotLottieReact
                  src="https://lottie.host/b16ac9e9-c198-41ff-9592-03cd4fe72562/OiXbqMHDnc.lottie"
                  autoplay
                  loop
                  style={{ height: 100, width: "100%", margin: "0 auto" }}
                />
              </Suspense>
            </div>
                     
            <h2 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">
              Bienvenue !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Connectez-vous pour continuer
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-center text-xs">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Nom d'utilisateur */}
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || !isOnline}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !isOnline}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:ring-gray-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || !isOnline}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading || !isOnline}
              className="w-full py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-black font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:scale-100 focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm mt-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connexion
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Message de support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Problème de connexion ?{" "}
              <button 
                type="button"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                onClick={() => {
                  // Ajouter ici la logique pour contacter le support
                  console.log("Contact support");
                }}
              >
                Contactez le support
              </button>
            </p>
          </div>
        </div>

        {/* Section image */}
        <div className="w-full lg:w-[400px] hidden lg:block h-48 lg:h-full">
          <Image
            quality={75}
            height={400}
            width={400}
            src="/img/army.jpg"
            alt="Forces armées"
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}