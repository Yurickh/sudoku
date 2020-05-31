import * as React from 'react'
import { Cell as CellState } from './useBoxes'

interface CellProps {
  error: boolean
  focus: boolean
  value: CellState
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const Cell: React.FunctionComponent<CellProps> = ({
  error,
  focus,
  value,
  onFocus,
  onBlur,
  onChange,
}) => {
  const className = [
    'cell',
    ...(error ? ['-error'] : []),
    ...(focus ? ['-focus'] : []),
  ].join(' ')

  return (
    <td className={className}>
      <input
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
      />
    </td>
  )
}
