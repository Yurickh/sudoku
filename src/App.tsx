import React, { useState, useEffect } from 'react'
import './App.css'
import { useBoxes, Box, Cell as CellState } from './useBoxes'
import {
  Coordinates,
  toGlobalCoordinates,
  GlobalCoordinates,
} from './coordinates'
import { Cell } from './Cell'

interface State {
  boxes: readonly Box[]
  focus: GlobalCoordinates | undefined
}

const initialState: State = {
  boxes: [...Array(9)].map(() =>
    [...Array(3)].map(() => [...Array(3)].fill('')),
  ),
  focus: undefined,
}

const selectRow = (boxes: State['boxes'], row: number) =>
  boxes.flatMap((box, boxIndex) =>
    Math.floor(boxIndex / 3) === Math.floor(row / 3) ? box[row % 3] : [],
  )

const selectBox = (boxes: State['boxes'], box: number) => boxes[box].flat()

const selectColumn = (boxes: State['boxes'], column: number) =>
  boxes.flatMap((box, boxIndex) =>
    boxIndex % 3 === Math.floor(column / 3)
      ? box.map((row) => row[column % 3])
      : [],
  )

const hasRepetition = (array: CellState[]): boolean =>
  new Set(array.filter(Boolean)).size < array.filter(Boolean).length

const parseDifference = (previousValue: CellState, newValue: number) => {
  if (newValue === 0) return ''
  if (previousValue === '') return newValue

  const parsedValue = Number(
    newValue.toString().replace(previousValue.toString(), ''),
  )

  if (parsedValue > 0 && parsedValue < 10) {
    return parsedValue
  } else {
    return previousValue
  }
}

const transformToBoxes = (sudoku: string): Box[] => {
  const cells = sudoku.split('').map((x) => (x === '0' ? '' : parseInt(x)))

  return [...Array(9)].map((_box, boxIndex) => {
    const baseIndex = 27 * Math.floor(boxIndex / 3) + (boxIndex % 3) * 3

    return [
      cells.slice(baseIndex, baseIndex + 3),
      cells.slice(baseIndex + 9, baseIndex + 9 + 3),
      cells.slice(baseIndex + 18, baseIndex + 18 + 3),
    ] as Box
  })
}

function App() {
  const [loading, setLoading] = useState(true)
  const [{ boxes, focus }, dispatch] = useBoxes(initialState)

  useEffect(() => {
    fetch('/api/get-problem')
      .then((res) => res.json())
      .then((initial) => {
        dispatch({ type: 'init', boxes: transformToBoxes(initial) })
        setLoading(false)
      })
  }, [dispatch])

  const hasError = (coordinates: Coordinates): boolean =>
    hasRepetition(selectBox(boxes, coordinates.box))
    || hasRepetition(selectRow(boxes, toGlobalCoordinates(coordinates).row))
    || hasRepetition(
      selectColumn(boxes, toGlobalCoordinates(coordinates).column),
    )

  const hasFocus = (coordinates: GlobalCoordinates): boolean =>
    focus !== undefined
    && (coordinates.row === focus.row || coordinates.column === focus.column)

  const handleChange = ({ box, row, cell }: Coordinates) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const previousValue = boxes[box][row][cell]
    const value = parseDifference(
      previousValue,
      Number(event.currentTarget.value),
    )

    dispatch({
      type: 'setValue',
      value,
      coordinates: { box, row, cell },
    })
  }

  const handleFocus = (coordinates: Coordinates) => (
    _event: React.FocusEvent<HTMLInputElement>,
  ) => {
    dispatch({
      type: 'focus',
      coordinates,
    })
  }

  const handleBlur = () => () => {
    dispatch({ type: 'blur' })
  }

  return (
    <div className="App App-header">
      <h1>Sudoku</h1>

      {loading && 'Loading...'}
      <div className="game">
        {boxes.map((boxArray, box) => (
          <table className="box" key={box}>
            <tbody>
              {boxArray.map((rowArray, row) => (
                <tr className="row" key={row}>
                  {rowArray.map((cellValue, cell) => (
                    <Cell
                      error={hasError({ box, row, cell })}
                      focus={hasFocus(toGlobalCoordinates({ box, row, cell }))}
                      value={cellValue}
                      onFocus={handleFocus({ box, row, cell })}
                      onBlur={handleBlur()}
                      onChange={handleChange({ box, row, cell })}
                      key={cell}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  )
}

export default App
