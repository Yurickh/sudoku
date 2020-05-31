export interface Coordinates {
  box: number
  row: number
  cell: number
}

export interface GlobalCoordinates {
  row: number
  column: number
}

export const toGlobalCoordinates = ({ box, row, cell }: Coordinates) => ({
  row: Math.floor(box / 3) * 3 + row,
  column: (box % 3) * 3 + cell,
})
