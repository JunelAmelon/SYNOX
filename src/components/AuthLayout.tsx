import React from 'react';
import { Link } from 'react-router-dom';
import { Vault, Moon, Sun } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  currentPage: 'login' | 'signup';
}

export default function AuthLayout({ children, title, subtitle, currentPage }: AuthLayoutProps) {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply dark mode to document
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-stone-50'
    }`}>
      {/* Theme Toggle Button */}
      <button  
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-4 right-4 z-50 p-3 rounded-xl transition-all duration-300 shadow-lg ${
          darkMode 
            ? 'text-amber-400 hover:bg-gray-800 bg-gray-800/80 backdrop-blur-sm' 
            : 'text-amber-600 hover:bg-white bg-white/80 backdrop-blur-sm shadow-md'
        }`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left Panel - Auth Form */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-start px-6 sm:px-8 md:px-12 lg:px-16 pb-8 sm:pb-12 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-stone-50 text-gray-900'
      }`}>
        {/* Logo avec taille augmentée et sans marge gauche */}
        <div className="flex items-center justify-start w-full">
          <img 
            src={darkMode ? "/logo-blanc.png" : "/logo-noir.png"}
            alt="SYNOX Logo" 
            className="h-[300px] sm:h-[360px] md:h-[420px] lg:h-[480px] w-auto object-contain"
          />
        </div>

        {/* Titre avec marge réduite */}
        <div className="mb-2 lg:mb-4 text-left mt-[-10px]">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-poly font-bold mb-3 leading-tight transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>{title}</h1>
          <p className={`text-base sm:text-lg leading-relaxed font-light transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{subtitle}</p>
        </div>

        {children}
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block w-full lg:w-1/2 relative min-h-screen">
        <img 
          src="https://img.freepik.com/photos-gratuite/partenaires-commerciaux-ensemble-au-bureau_1303-25416.jpg?semt=ais_hybrid&w=740" 
          alt="Happy woman celebrating financial success with laptop and documents" 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Card */}
        <div className={`absolute bottom-8 right-8 backdrop-blur-sm rounded-xl p-6 max-w-xs shadow-lg transition-colors duration-300 ${
          darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'
        }`}>
          <div className="mb-4">
            <h3 className={`font-poly font-bold mb-3 text-lg transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Réussite Financière</h3>
            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              "Grâce à SYNOX, j'ai enfin atteint mes objectifs d'épargne ! L'application rend la gestion financière simple et motivante."
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center mr-3">
              <span className="text-xs font-poly font-bold text-white">SM</span>
            </div>
            <div>
              <p className={`text-sm font-poly font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Sophie M.</p>
              <p className={`text-xs transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Entrepreneur, Paris</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}