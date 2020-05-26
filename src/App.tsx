import React, { ChangeEvent } from 'react'
import produce from 'immer'
import './App.css'

type Cell = number | ''
type Row = Cell[]
type Box = Row[]

const initialState: Box[] = [...Array(9)].map(() =>
  [...Array(3)].map(() => [...Array(3)].fill('')),
)

interface Action {
  value: Cell
  box: number
  row: number
  cell: number
}

const boxesReducer = produce((draft: Box[], action: Action) => {
  draft[action.box][action.row][action.cell] = action.value
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
  const [boxes, dispatch] = React.useReducer(boxesReducer, initialState)

  const handleChange = (box: number, row: number, cell: number) => (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const previousValue = boxes[box][row][cell]
    const value = parseDifference(
      previousValue,
      Number(event.currentTarget.value),
    )

    dispatch({
      box,
      row,
      cell,
      value,
    })
  }

  return (
    <div className="App App-header">
      <h1>Sudoku</h1>

      <div className="game">
        {boxes.map((box, boxIndex) => (
          <table className="box" key={boxIndex}>
            <tbody>
              {box.map((row, rowIndex) => (
                <tr className="row" key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td className="cell" key={cellIndex}>
                      <input
                        value={cell}
                        onChange={handleChange(boxIndex, rowIndex, cellIndex)}
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
