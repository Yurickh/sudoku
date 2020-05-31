import { NowRequest, NowResponse } from '@now/node'
import data from '../sudoku.json'

const sample = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)]

export default function getProblem(_req: NowRequest, res: NowResponse) {
  res.json(sample(data as string[]))
}
