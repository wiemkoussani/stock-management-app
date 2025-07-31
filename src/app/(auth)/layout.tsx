import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'


interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000, // Durée par défaut
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </div>
  )
}