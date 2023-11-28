import { useState, useEffect, useRef } from 'react'

const SIZE_WIDTH = 300
const SIZE_HEIGHT = 300
const SIZE_CELL_WIDTH = 2
const SIZE_CELL_HEIGHT = 2
const MAX_INT = 4
const THRESHOLD = 3
// const MapIntToColor = [
//   'red',
//   'orange',
//   'yellow',
//   'green',
//   'blue',
//   'indigo',
//   'violet',
// ]
const MapIntToColor = [
  'red',
  'yellow',
  'green',
  'blue',
  'orange',
  'violet',
  'indigo',
]
const getDefaultDataCyclic = () => {
  const defaultData = []
  for (let i = 0; i < SIZE_HEIGHT; i++) {
    const row = []
    for (let j = 0; j < SIZE_WIDTH; j++) {
      row.push(Math.floor(Math.random() * MAX_INT))
    }
    defaultData.push(row)
  }
  return defaultData
}
const getDefaultDataNormal = () => {
  const defaultData = []
  for (let i = 0; i < SIZE_HEIGHT; i++) {
    const row = []
    for (let j = 0; j < SIZE_WIDTH; j++) {
      row.push(false)
    }
    defaultData.push(row)
  }
  return defaultData
}
function getCellNextState(data, row, column) {
  const currentCell = data[row][column]
  let countLiveNeighbor = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (data?.[row + i]?.[column + j]) {
        if (i !== 0 || j !== 0) countLiveNeighbor++
      }
    }
  }
  if (currentCell) {
    if (countLiveNeighbor < 2) return false
    if (countLiveNeighbor <= 3) return true
    return false
  }
  if (countLiveNeighbor === 3) return true
  return false
}

function getCellNextStateCyclic(data, row, column) {
  const currentCell = data[row][column]
  let countLiveNeighbor = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue
      const currentNeighbor = data?.[row + i]?.[column + j]
      if (
        currentNeighbor === currentCell + 1 ||
        (currentCell === MAX_INT - 1 && currentNeighbor === 0)
      ) {
        countLiveNeighbor++
      }
    }
  }
  if (countLiveNeighbor >= THRESHOLD) {
    if (currentCell === MAX_INT - 1) return 0
    return currentCell + 1
  }
  return currentCell
}
function getNextTick(data) {
  return data.map((row, y) => {
    return row.map((column, x) => {
      return getCellNextStateCyclic(data, y, x)
    })
  })
}

const defaultData = getDefaultDataCyclic()

function App() {
  const [setup, setSetup] = useState(true)
  const timeoutRef = useRef()
  const getNextTickTimeout = () => {
    setDataAndDraw(getNextTick(dataRef.current))
  }
  const getNextTickTimeoutRef = useRef(getNextTickTimeout)
  getNextTickTimeoutRef.current = getNextTickTimeout
  const dataRef = useRef(defaultData)
  const startTimeOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    timeoutRef.current = setTimeout(() => {
      if (setup) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        return
      }
      getNextTickTimeoutRef.current()
      startTimeOut()
    }, 50)
  }
  useEffect(() => {
    if (setup) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else {
      startTimeOut()
    }
  }, [setup])
  const setDataAndDraw = (newData) => {
    dataRef.current = newData
    drawData(newData)
  }
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          border: '1px solid black',
        }}
      >
        <div
          style={{
            marginBottom: 5,
          }}
        >
          <button
            style={{ marginRight: 5 }}
            onClick={() => {
              setSetup((v) => !v)
            }}
          >
            {setup ? 'Start' : 'Stop'}
          </button>
          <button
            onClick={() => {
              setDataAndDraw(getDefaultDataCyclic())
            }}
          >
            Clear
          </button>
        </div>
        <canvas
          id="canvas"
          width={SIZE_WIDTH * SIZE_CELL_WIDTH}
          height={SIZE_HEIGHT * SIZE_CELL_HEIGHT}
          style={{
            border: '1px solid black',
          }}
        ></canvas>
      </div>
    </div>
  )
}

export default App

function drawData(data) {
  data.forEach((row, y) => {
    row.forEach((item, x) => {
      drawPixel(x, y, MapIntToColor[item])
    })
  })
}

// That's how you define the value of a pixel //
function drawPixel(x, y, color) {
  var canvas = document.getElementById('canvas')
  var ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(
    x * SIZE_CELL_WIDTH,
    y * SIZE_CELL_HEIGHT,
    SIZE_CELL_WIDTH,
    SIZE_CELL_HEIGHT
  )
}
