import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "./store/authStore";
import { useAppearanceStore } from "./store/useAppearanceStore";
import { useShallow } from "zustand/react/shallow";
import { Toaster } from "react-hot-toast";
import { GlobalErrorBoundary } from "./components/ui/GlobalErrorBoundary";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const checkSetupStatus = useAuthStore((state) => state.checkSetupStatus);
  const { theme, primaryColor, animations, highContrast } = useAppearanceStore(
    useShallow((state) => ({
      theme: state.theme,
      primaryColor: state.primaryColor,
      animations: state.animations,
      highContrast: state.highContrast,
    }))
  );

  useEffect(() => {
    // Check if user is logged in via cookie on initial boot
    checkAuth();
    checkSetupStatus();
  }, [checkAuth, checkSetupStatus]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce Motion
    if (!animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Primary Color Injection
    const colorMaps = {
      orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 500: '#f97316', 600: '#ea580c' },
      blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b82f6', 600: '#2563eb' },
      purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 500: '#a855f7', 600: '#9333ea' },
      green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 500: '#22c55e', 600: '#16a34a' },
      red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 500: '#ef4444', 600: '#dc2626' }
    };
    
    const colors = colorMaps[primaryColor] || colorMaps.orange;
    root.style.setProperty('--color-primary-50', colors[50]);
    root.style.setProperty('--color-primary-100', colors[100]);
    root.style.setProperty('--color-primary-200', colors[200]);
    root.style.setProperty('--color-primary-500', colors[500]);
    root.style.setProperty('--color-primary-600', colors[600]);

  }, [theme, primaryColor, animations, highContrast]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <GlobalErrorBoundary>
        <AppRouter />
        <PWAInstallPrompt />
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
