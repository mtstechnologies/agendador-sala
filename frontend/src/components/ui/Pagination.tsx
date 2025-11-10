import React from 'react'
import { Button } from './Button'

type Props = {
  page: number
  totalPages: number
  total?: number
  onPageChange?: (page: number) => void
}

export function Pagination({ page, totalPages, total, onPageChange }: Props) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-sm text-gray-600">
        {typeof total === 'number' ? `Total: ${total} • ` : null}
        Página {page} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={!canPrev}
        >Anterior</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(canNext ? page + 1 : page)}
          disabled={!canNext}
        >Próxima</Button>
      </div>
    </div>
  )
}

export default Pagination
