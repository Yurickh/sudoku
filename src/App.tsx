import React from 'react'
import produce from 'immer'
import './App.css'

type Cell = number | ''
type Row = readonly Cell[]
type Box = readonly Row[]

interface Coordinates {
  box: number
  row: number
  cell: number
}

interface GlobalCoordinates {
  row: number
  column: number
}

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

type Action =
  | {
      type: 'setValue'
      value: Cell
      coordinates: Coordinates
    }
  | {
      type: 'focus'
      coordinates: Coordinates
    }
  | { type: 'blur' }

const toGlobalCoordinates = ({ box, row, cell }: Coordinates) => ({
  row: Math.floor(box / 3) * 3 + row,
  column: (box % 3) * 3 + cell,
})

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

const hasRepetition = (array: Cell[]): boolean =>
  new Set(array.filter(Boolean)).size < array.filter(Boolean).length

const boxesReducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case 'setValue': {
      const {
        coordinates: { box, row, cell },
        value,
      } = action
      // Override the readonly
      const boxes = draft.boxes as Cell[][][]
      boxes[box][row][cell] = value

      break
    }

    case 'focus': {
      const { coordinates } = action
      draft.focus = toGlobalCoordinates(coordinates)

      break
    }

    case 'blur': {
      draft.focus = undefined
      break
    }
  }
})

const parseDifference = (previousValue: Cell, newValue: number) => {
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

function App() {
  const [{ boxes, focus }, dispatch] = React.useReducer(
    boxesReducer,
    initialState,
  )

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
    event: React.FocusEvent<HTMLInputElement>,
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

      <div className="game">
        {boxes.map((boxArray, box) => (
          <table className="box" key={box}>
            <tbody>
              {boxArray.map((rowArray, row) => (
                <tr className="row" key={row}>
                  {rowArray.map((cellValue, cell) => (
                    <td
                      className={`cell ${
                        hasError({ box, row, cell }) ? '-error' : ''
                      } ${
                        hasFocus(toGlobalCoordinates({ box, row, cell }))
                          ? '-focus'
                          : ''
                      }`}
                      key={cell}
                    >
                      <input
                        value={cellValue}
                        onFocus={handleFocus({ box, row, cell })}
                        onBlur={handleBlur()}
                        onChange={handleChange({ box, row, cell })}
                      />
                    </td>
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
