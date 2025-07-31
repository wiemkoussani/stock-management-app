'use client'

interface AuthSectionProps {
  username: string
  onLogout: () => void
}

export default function AuthSection({ username, onLogout }: AuthSectionProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        {username && <p className="text-gray-600">Connecté en tant que {username}</p>}
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Déconnexion
      </button>
    </div>
  )
} 