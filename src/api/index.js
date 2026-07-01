const getActionURI = (keyString) =>
  `https://script.google.com/macros/s/${keyString}/exec`

// Aid registration key
// const key = 'AKfycbyOrdI3vt7wOHg6V-ZmhQGgXfBJrBqLAcM9j4Yh0YGLSJVCo6wiLo0b3jplTUtXGZZ9'
const key =
  'AKfycby4zHlnVqFmLRfrC0-0aRk_300qKQrhbT-bvPIUkIJsKyVUXkOwb-jILKxYmsDWTBtQ'
// TEST KEY
// const key =
//   'AKfycbwk5OwCJ6x25C3gRObOIw23W8gYVhB6x7te3rUhjGNb5fl8MBu-EXvu__vU3ppYvHEcSA'

// HUB's queue key
const hubKey =
  'AKfycby4zHlnVqFmLRfrC0-0aRk_300qKQrhbT-bvPIUkIJsKyVUXkOwb-jILKxYmsDWTBtQ'
// hub's test key
// const hubKey =
//   'AKfycby4HqOSJ0ltYInfWXzmxbeqFcDVuW2tY30GOb4zUkdbM_67nCkGbFxB004g2ydvJZKl'

const clothesKey =
  'AKfycbymPkQbrAix6CmeLX3uljb-sz3ZuYVIyaKksppndcNPro4lEE29fFXVmhEnjT2pIBML4w'

export const action = getActionURI(key)
export const hubAction = getActionURI(hubKey)
export const clothesAction = getActionURI(clothesKey)
