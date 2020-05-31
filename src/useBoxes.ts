import * as React from 'react'
import produce from 'immer'
import {
  Coordinates,
  GlobalCoordinates,
  toGlobalCoordinates,
} from './coordinates'

export type Cell = number | ''
export type Row = readonly Cell[]
export type Box = readonly Row[]

interface State {
  boxes: readonly Box[]
  focus: GlobalCoordinates | undefined
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
  | {
      type: 'init'
      boxes: Box[]
    }

const boxesReducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case 'init': {
      draft.boxes = action.boxes
      break
    }
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

export const useBoxes = (initialState: State) =>
  React.useReducer(boxesReducer, initialState)
