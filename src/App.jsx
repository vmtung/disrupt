import { useState, useEffect, useRef } from 'react'

const SIZE_WIDTH = 120
const SIZE_HEIGHT = 120
const SIZE_CELL_WIDTH = 5
const SIZE_CELL_HEIGHT = 5
const hexToInt = (s) => parseInt(s, 16)
const intToHex = (n) => n.toString(16)
const MAX_INT = 4
const THRESHOLD = 2
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

function App() {
  const [data, setData] = useState(() => getDefaultDataCyclic())
  const [setup, setSetup] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [refreshKey, setRefreshKey] = useState(false)
  const timeoutRef = useRef()
  const getNextTickTimeout = () => {
    setData(getNextTick(data))
  }
  const getNextTickTimeoutRef = useRef(getNextTickTimeout)
  getNextTickTimeoutRef.current = getNextTickTimeout
  const dataRef = useRef(data)
  const startTimeOut = () => {
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
    }, 100)
  }
  useEffect(() => {
    if (setup) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else {
      setData(dataRef.current)
      startTimeOut()
    }
  }, [setup])
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
              if (!setup) {
                dataRef.current = data
              }
              setSetup((v) => !v)
            }}
          >
            {setup ? 'Start' : 'Stop'}
          </button>
          <button
            onClick={() => {
              const defaultData = getDefaultDataCyclic()
              setData(defaultData.slice())
              dataRef.current = defaultData.slice()
              setRefreshKey((v) => !v)
            }}
          >
            Clear
          </button>
        </div>
        <div
          key={String(setup) + String(refreshKey)}
          onMouseDown={() => {
            if (!setup) return
            setDragging(true)
          }}
          onMouseUp={() => {
            setDragging(false)
          }}
        >
          {data.map((row, index) => (
            <div
              style={{
                display: 'flex',
              }}
              key={index}
            >
              {row.map((item, _index) => (
                <Cell
                  key={_index}
                  setup={setup}
                  dragging={dragging}
                  onChange={(v) => {
                    dataRef.current[index][_index] = v
                  }}
                  value={item}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

const Cell = ({ onChange, value: valueProps, setup, dragging }) => {
  const [value, setValue] = useState(valueProps)
  const displayValue = !setup ? valueProps : value
  return (
    <div
      style={{
        width: SIZE_CELL_WIDTH,
        height: SIZE_CELL_HEIGHT,
        background: MapIntToColor[displayValue],
        // border: '1px solid lightgray',
      }}
      onMouseDown={() => {
        if (!setup) return
        onChange(!value)
        setValue(!value)
      }}
      onMouseOver={() => {
        if (!setup || !dragging) return
        onChange(!value)
        setValue(!value)
      }}
    ></div>
  )
}
