const SIZE_WIDTH = 400
const SIZE_HEIGHT = 400
const SIZE_CELL_WIDTH = 2
const SIZE_CELL_HEIGHT = 2
const MAX_INT = 5
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
  'violet',
  'orange',
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
        (currentCell < MAX_INT - 1 && currentNeighbor === currentCell + 1) ||
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
  const newDrawData = []
  data.forEach((row, y) => {
    row.forEach((column, x) => {
      const newColor = getCellNextStateCyclic(data, y, x)
      if (newColor !== column)
        newDrawData.push({
          x,
          y,
          color: newColor,
        })
    })
  })
  return newDrawData
}

let setup = true
let timeout
let data = []
const setDataAndDraw = (newData) => {
  data = newData
  drawData(newData)
}
const getNextTickTimeout = () => {
  const drawArr = getNextTick(data)
  drawArr.forEach(({ x, y, color }) => {
    data[y][x] = color
    drawPixel(x, y, MapIntToColor[color])
  })
}
const startTimeOut = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  timeout = setTimeout(() => {
    if (setup) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      return
    }
    getNextTickTimeout()
    startTimeOut()
  }, 10)
}

function drawData(data) {
  data.forEach((row, y) => {
    row.forEach((item, x) => {
      drawPixel(x, y, MapIntToColor[item])
    })
  })
}

var canvas = document.getElementById('canvas')
canvas.setAttribute('width', SIZE_WIDTH * SIZE_CELL_WIDTH)
canvas.setAttribute('height', SIZE_HEIGHT * SIZE_CELL_HEIGHT)
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

function toggleSetup(ref) {
  setup = !setup
  ref.innerHTML = setup ? 'Start' : 'Stop'
  if (!setup) {
    startTimeOut()
  }
}
setDataAndDraw(getDefaultDataCyclic())
