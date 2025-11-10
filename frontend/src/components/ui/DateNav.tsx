import React from 'react'
import { Button } from './Button'
import { DatePicker } from './DatePicker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { parseYmd } from '../../lib/time'

type DateNavProps = {
  value: string | '' // yyyy-MM-dd ou vazio
  onChange: (iso: string) => void
  size?: 'sm' | 'md'
  className?: string
  showToday?: boolean
  showClear?: boolean
  onClear?: () => void
}

export function DateNav({ value, onChange, size = 'md', className, showToday = true, showClear = false, onClear }: DateNavProps) {
  // Se value vier vazio, usamos a data atual como base visual e de navegação
  const base = (() => {
    const p = value ? parseYmd(value) : null
    return p ? new Date(p.Y, p.M, p.D) : new Date()
  })()

  const goDelta = (days: number) => {
    const next = addDays(base, days)
    onChange(format(next, 'yyyy-MM-dd'))
  }

  const goToday = () => onChange(format(new Date(), 'yyyy-MM-dd'))

  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <Button size={size === 'sm' ? 'icon-sm' : 'icon'} variant="outline" onClick={() => goDelta(-1)} aria-label="Dia anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className={size === 'sm' ? 'w-[220px]' : 'w-[260px]'}>
        <DatePicker value={value || ''} onChange={onChange} size={size} />
      </div>
      <Button size={size === 'sm' ? 'icon-sm' : 'icon'} variant="outline" onClick={() => goDelta(1)} aria-label="Próximo dia">
        <ChevronRight className="h-4 w-4" />
      </Button>
      {showToday && (
        <Button size={size} variant="outline" onClick={goToday}>Hoje</Button>
      )}
      {showClear && (
        <Button
          size={size}
          variant="outline"
          onClick={() => {
            if (onClear) onClear()
            else onChange('')
          }}
        >
          Limpar
        </Button>
      )}
    </div>
  )
}

export default DateNav
