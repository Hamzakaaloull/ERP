
"use client";

import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import CssBaseline from "@mui/material/CssBaseline";

import { Toaster } from "sonner"
export default function RootLayout({ children }) {


  useEffect(() => {
      if ('serviceWorker' in navigator) {
        // سجّل فقط في الإنتاج أو على localhost
        const isLocalhost = Boolean(
          window.location.hostname === 'localhost' ||
          window.location.hostname === '[::1]' ||
          window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/)
        );
  
        if (process.env.NODE_ENV === 'production' || isLocalhost) {
          navigator.serviceWorker.register('/service-worker.js')
            .then(reg => {
              console.log('Service worker registered:', reg);
  
              // استمع لتحديثات الـ SW لإبلاغ المستخدم
              reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // هناك نسخة جديدة جاهزة
                      // يمكنك إظهار UI يخبر المستخدم "نسخة جديدة متوفرة"
                      console.log('New content available; please refresh.');
                      // على سبيل المثال: dispatch حدث/تغيير حالة لعرض زر إعادة التحميل
                    } else {
                      console.log('Content is cached for offline use.');
                    }
                  }
                });
              });
            })
            .catch(err => {
              console.error('Service worker registration failed:', err);
            });
  
          // استماع لرسائل من الـ SW (مثال: SKIP_WAITING confirmation)
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('SW message:', event.data);
          });
        }
      }
    }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="img/favicon.png" />
        <link rel="icon" type="image/png" sizes='32x32' href="favicon/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <title>Gestion des Pannes</title>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* i want to add manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Add loading strategy for LCP image */}
        <link rel="preload" href="/img/army.jpg" as="image" />
      </head>
      <body>
        <CssBaseline />
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Toaster 
          position="top-right"
          theme="system"
          richColors
          closeButton
          duration={4000}
        />
          </ThemeProvider>
      </body>
    </html>
  );
}