import React, { useState, FC, useEffect } from 'react';
import { Toast } from '../types';
import * as supabaseService from '../services/supabaseService';
import { ArrowPathIcon, ExclamationTriangleIcon, GoogleIcon, InformationCircleIcon, CheckCircleIcon } from './icons';

interface LoginScreenProps {
  showToast: (message: string, type?: Toast['type']) => void;
}

const LoginScreen: FC<LoginScreenProps> = ({ showToast }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originUrl, setOriginUrl] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showSupabaseUrlHelper, setShowSupabaseUrlHelper] = useState(false);

  useEffect(() => {
    // This effect runs on the client and captures the browser's origin URL.
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      setOriginUrl(currentOrigin);
      if (currentOrigin.includes('usercontent')) {
        setShowSupabaseUrlHelper(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("L'e-mail et le mot de passe sont requis.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = isLoginView
      ? await supabaseService.signInUser(email, password)
      : await supabaseService.signUpUser(email, password);

    setIsLoading(false);
    
    if (result.error) {
      setError(result.error);
    } else if (!isLoginView) {
      setSignupSuccess(true);
    }
    // Pour la connexion, onAuthStateChange dans App.tsx s'occupera du reste.
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const { error } = await supabaseService.signInWithGoogle();
    
    // La redirection se produit, donc le chargement ne s'arrêtera que si une erreur se produit avant la redirection.
    if (error) {
      setIsGoogleLoading(false);
      setError(error);
      showToast(error, 'error');
    }
    // Pas de toast de succès ici, car la redirection va se produire avant qu'il ne soit visible.
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-light-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-light-text">PublicityPro</h1>
            <p className="text-light-text-secondary mt-2">Votre copilote publicitaire IA</p>
        </div>
        
        <div className="glass-card p-8 rounded-3xl">
          {signupSuccess ? (
            <div className="text-center animate-fade-in-up">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Vérifiez vos e-mails !</h2>
              <p className="text-light-text-secondary">
                Un lien de confirmation a été envoyé à <strong className="text-light-text">{email}</strong>. Cliquez dessus pour activer votre compte.
              </p>
              <button 
                onClick={() => {
                    setIsLoginView(true);
                    setSignupSuccess(false);
                    setEmail('');
                    setPassword('');
                    setError(null);
                }}
                className="mt-6 w-full flex justify-center py-3 px-4 rounded-btn text-light-accent font-semibold bg-light-accent/10 hover:bg-light-accent/20"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {isLoginView ? 'Connexion' : 'Créer un compte'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-light-text-secondary">Adresse e-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent"
                  />
                </div>

                <div>
                  <label htmlFor="password"className="block text-sm font-medium text-light-text-secondary">Mot de passe</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLoginView ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent"
                  />
                </div>
                
                {!isLoginView && (
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="focus:ring-light-accent h-4 w-4 text-light-accent border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-light-text-secondary">
                        J'accepte les{' '}
                        <a href="#" className="font-medium text-light-accent hover:underline">
                          Conditions d'utilisation
                        </a>{' '}
                        et la{' '}
                        <a href="#" className="font-medium text-light-accent hover:underline">
                          Politique de confidentialité
                        </a>
                        .
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 text-red-700 p-3 rounded-btn text-sm flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading || (!isLoginView && !agreedToTerms)}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-btn shadow-md text-white bg-light-accent hover:bg-light-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin"/>
                    ) : (
                      isLoginView ? 'Se connecter' : 'S\'inscrire'
                    )}
                  </button>
                </div>
              </form>

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-black/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white/5 text-light-text-secondary backdrop-blur-sm rounded-full">OU</span>
                  </div>
              </div>

              <div>
                  <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading || isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-black/10 rounded-btn shadow-sm bg-white/50 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isGoogleLoading ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin"/>
                      ) : (
                          <>
                              <GoogleIcon className="w-5 h-5" />
                              <span className="text-sm font-semibold text-light-text">Continuer avec Google</span>
                          </>
                      )}
                  </button>
              </div>
              
              {showSupabaseUrlHelper && (
                  <div className="mt-6 bg-blue-500/10 text-blue-900 p-4 rounded-2xl text-sm space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                          <InformationCircleIcon className="w-6 h-6 flex-shrink-0" />
                          <span>Action requise pour la configuration</span>
                      </div>
                      <p>Pour que les confirmations par e-mail et la connexion Google fonctionnent, veuillez ajouter cette URL à la configuration de votre projet Supabase :</p>
                      <ol className="list-decimal list-inside space-y-1 pl-2">
                          <li>Allez dans <strong className="font-semibold">Authentication &gt; URL Configuration</strong>.</li>
                          <li>Copiez l'URL ci-dessous et collez-la dans le champ <strong className="font-semibold">"Site URL"</strong>.</li>
                          <li>Allez dans <strong className="font-semibold">Authentication &gt; Providers &gt; Google</strong>.</li>
                          <li>Ajoutez l'URL ci-dessous à vos <strong className="font-semibold">"Redirect URLs"</strong> autorisées.</li>
                      </ol>
                      <div className="font-mono bg-black/10 p-2 rounded break-all text-xs mt-2 select-all">
                          {originUrl}
                      </div>
                  </div>
              )}

              <p className="mt-6 text-center text-sm text-light-text-secondary">
                {isLoginView ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'}
                <button onClick={() => { 
                  setIsLoginView(!isLoginView); 
                  setError(null); 
                  setEmail('');
                  setPassword('');
                }} className="font-medium text-light-accent hover:text-light-accent-hover ml-1">
                  {isLoginView ? 'Inscrivez-vous' : 'Connectez-vous'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;