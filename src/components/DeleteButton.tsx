'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  entityType: 'teacher' | 'student' | 'class' | 'grade' | 'subject' | 'demo'
  entityId: string
  entityName: string
  onDelete?: () => void
  className?: string
}

export function DeleteButton({ 
  entityType, 
  entityId, 
  entityName, 
  onDelete,
  className = ''
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Fix pluralization for 'class' -> 'classes'
      const apiPath = entityType === 'class' ? 'classes' : `${entityType}s`
      const response = await fetch(`/api/${apiPath}/${entityId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setShowConfirm(false)
        // Call the onDelete callback to refresh the parent component
        onDelete?.()
        // Show success message
        alert(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully!`)
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to delete: ${errorText}`)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert(`Failed to delete ${entityType}. Please try again.`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className={`inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${className}`}
        disabled={isDeleting}
        title={`Delete ${entityName}`}
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{entityName}</strong>? 
              This action will deactivate the {entityType} and it will no longer appear in active lists.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 