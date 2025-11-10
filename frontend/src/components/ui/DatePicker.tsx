import React, { useMemo, useState } from 'react'
import clsx from 'clsx'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { parseYmd } from '../../lib/time'

type DatePickerProps = {
  label?: string
  value: string // yyyy-MM-dd
  onChange: (isoDate: string) => void
  min?: string // yyyy-MM-dd
  size?: 'sm' | 'md'
  className?: string
}

export function DatePicker({ label, value, onChange, min, size = 'md', className }: DatePickerProps) {
  const selectedParts = value ? parseYmd(value) : null
  const initialDate = selectedParts ? new Date(selectedParts.Y, selectedParts.M, selectedParts.D) : new Date()
  const [open, setOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialDate))

  const minParts = min ? parseYmd(min) : null
  const minDate = minParts ? new Date(minParts.Y, minParts.M, minParts.D) : undefined

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    const days: Date[] = []
    let day = start
    while (day <= end) {
      days.push(day)
      day = addDays(day, 1)
    }
    // chunk em semanas
    const result: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [currentMonth])

  const selectedDate = selectedParts ? new Date(selectedParts.Y, selectedParts.M, selectedParts.D) : undefined

  const handleSelect = (d: Date) => {
    const sd = startOfDay(d)
    if (minDate && isBefore(sd, startOfDay(minDate))) return
    onChange(format(sd, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  const display = selectedDate
    ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : ''

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          className={clsx(
            'input flex items-center justify-between text-left',
            size === 'sm' ? 'h-8 py-1 text-sm' : 'h-10',
            className
          )}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="truncate text-gray-900">{display}</span>
          <CalendarIcon className="h-4 w-4 text-gray-500" />
        </button>

        {open && (
          <div className="absolute z-[100] mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-medium">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </div>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-100"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {weeks.flat().map((day) => {
                  const isOutside = !isSameMonth(day, currentMonth)
                  const isSelected = !!(selectedDate && day.getFullYear() === selectedDate.getFullYear() && day.getMonth() === selectedDate.getMonth() && day.getDate() === selectedDate.getDate())
                  const isDisabled = !!(minDate && isBefore(day, startOfDay(minDate)))
                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      disabled={isDisabled}
                      onClick={() => handleSelect(day)}
                      className={[
                        'h-9 w-9 rounded-md text-center mx-auto',
                        isSelected ? 'bg-primary-100 text-primary-800 font-semibold' : '',
                        isOutside ? 'text-gray-300' : 'text-gray-700',
                        isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100',
                      ].join(' ')}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
