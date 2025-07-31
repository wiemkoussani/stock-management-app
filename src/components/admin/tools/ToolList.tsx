'use client'
import { useState } from 'react'
import { PatteTool, CoupelleTool } from '@/types/admin'
import PatteToolForm from './PatteToolForm'
import CoupelleToolForm from './CoupelleToolForm'

interface ToolListProps {
  toolType: 'patte' | 'coupelle'
  tools: (PatteTool | CoupelleTool)[]
  loading: boolean
  onEdit: (tool: PatteTool | CoupelleTool) => void
  onDelete: (id: string) => void
} 

const ToolList = ({ toolType, tools, loading, onEdit, onDelete }: ToolListProps) => {
  const [editingTool, setEditingTool] = useState<PatteTool | CoupelleTool | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun outil trouvé
      </div>
    )
  }

  return (
    <>
      {editingTool && (
        <div className="mb-6 no-print">
          {toolType === 'patte' ? (
            <PatteToolForm 
              initialData={editingTool as PatteTool} 
              onCancel={() => setEditingTool(null)}
              onSuccess={() => {
                setEditingTool(null)
                onEdit(editingTool)
              }}
            />
          ) : (
            <CoupelleToolForm 
              initialData={editingTool as CoupelleTool} 
              onCancel={() => setEditingTool(null)}
              onSuccess={() => {
                setEditingTool(null)
                onEdit(editingTool)
              }}
            />
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(tools[0] || {})
                .filter(key => key !== 'id' && key !== 'created_at')
                .map(key => (
                  <th 
                    key={key} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key.replace(/_/g, ' ')}
                  </th>
                ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tools.map((tool) => (
              <tr key={tool.id}>
                {Object.entries(tool)
                  .filter(([key]) => key !== 'id' && key !== 'created_at')
                  .map(([key, value]) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {value || '-'}
                    </td>
                  ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2 no-print">
                  <button
                    onClick={() => setEditingTool(tool)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(tool.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ToolList 