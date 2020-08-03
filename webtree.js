const DEFAULT_LINE_THICKNESS = 1
const DEFAULT_DEGREES = 25
const DEFAULT_HEIGHT_FACTOR = 0.66
const DEFAULT_BRANCHING = 8

let thickness = DEFAULT_LINE_THICKNESS
let degrees = DEFAULT_DEGREES
let heightFactor = DEFAULT_HEIGHT_FACTOR
let branching = 10 - DEFAULT_BRANCHING

const radians = (degreesToConvert) => (degreesToConvert * Math.PI) / 180

let direction = radians(0)

let width
let height
let canvas
let branchLength
let theta

const setupCanvas = () => {
  width = document.body.clientWidth
  height = document.body.clientHeight

  canvas = document.querySelector('#canvas')
  canvas.width = width
  canvas.height = height
  branchLength = height / 4
}

setupCanvas()

const context = canvas.getContext('2d')

window.addEventListener('resize', () => {
  setupCanvas()
  draw()
})

const thicknessSlider = document.querySelector('#thicknessSlider')
const degreesSlider = document.querySelector('#degreesSlider')
const heightSlider = document.querySelector('#heightSlider')
const branchingSlider = document.querySelector('#branchingSlider')
const directionSlider = document.querySelector('#directionSlider')

thicknessSlider.addEventListener('input', (event) => {
  thickness = event.target.value
  draw()
})

degreesSlider.addEventListener('input', (event) => {
  degrees = event.target.value
  draw()
})

heightSlider.addEventListener('input', (event) => {
  heightFactor = event.target.value
  draw()
})

branchingSlider.addEventListener('input', (event) => {
  branching = 10 - event.target.value
  draw()
})

directionSlider.addEventListener('input', (event) => {
  direction = radians(event.target.value)
  draw()
})

const resetThicknessButton = document.querySelector('#resetThickness')
const resetDegreesButton = document.querySelector('#resetDegrees')
const resetHeightButton = document.querySelector('#resetHeight')
const resetBranchingButton = document.querySelector('#resetBranching')
const resetDirectionButton = document.querySelector('#resetDirection')

const resetThickness = () => {
  thickness = DEFAULT_LINE_THICKNESS
  thicknessSlider.value = DEFAULT_LINE_THICKNESS
}

const resetDegrees = () => {
  degrees = DEFAULT_DEGREES
  degreesSlider.value = DEFAULT_DEGREES
}

const resetHeight = () => {
  heightFactor = DEFAULT_HEIGHT_FACTOR
  heightSlider.value = DEFAULT_HEIGHT_FACTOR
}

const resetBranching = () => {
  branching = 10 - DEFAULT_BRANCHING
  branchingSlider.value = 10 - DEFAULT_BRANCHING
}

const resetDirection = () => {
  direction = radians(0)
  directionSlider.value = radians(0)
}

resetThicknessButton.addEventListener('click', () => {
  resetThickness()
  draw()
})

resetDegreesButton.addEventListener('click', () => {
  resetDegrees()
  draw()
})

resetHeightButton.addEventListener('click', () => {
  resetHeight()
  draw()
})

resetBranchingButton.addEventListener('click', () => {
  resetBranching()
  draw()
})

resetDirectionButton.addEventListener('click', () => {
  resetDirection()
  draw()
})

const resetAllButton = document.querySelector('#resetAllControls')

resetAllButton.addEventListener('click', () => {
  resetThickness()
  resetDegrees()
  resetHeight()
  resetBranching()
  resetDirection()
  draw()
})

const copyToClipboardButton = document.querySelector('#copyToClipboard')

copyToClipboardButton.addEventListener('click', () => {
  const notification = document.querySelector('#copyToClipboardNotification')
  navigator.permissions.query({ name: 'clipboard-write' })
    .then(result => {
      canvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob })
        if (result.state === 'granted' || result.state === 'prompt') {
          navigator.clipboard.write([item])
          notification.textContent = 'Tree copied to Clipboard!'
          return
        }
        notification.textContent = 'Unable to copy to Clipboard! The necessary permissions were not granted.'
      })
    },
      () => {
        notification.textContent = 'Unable to copy to Clipboard! Does your browser support the Clipboard API?'
      })
    .finally(() => {
      notification.removeAttribute('hidden')
      setTimeout(() => {
        notification.setAttribute('hidden', true)
      }, 5000)
    })
})

const saveAsImageButton = document.querySelector('#saveAsImage')

saveAsImageButton.addEventListener('click', () => {
  const link = document.createElement('a')
  link.download = 'image.png'
  canvas.toBlob(blob => {
    link.href = URL.createObjectURL(blob)
    link.click()
  }, 'image/png')
})

const draw = () => {
  theta = radians(degrees)

  // Clear canvas completely
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)

  // Fill canvas with white - to avoid transparent images in clipboard or file
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'black'

  // start drawing here
  context.translate(width / 2, height)
  context.rotate(direction)
  context.lineWidth = thickness
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, -branchLength)
  context.stroke()

  // Move to the end of that line
  context.translate(0, -branchLength)

  // start recursion
  branch(branchLength)
}

const drawBranch = (branchHeight, radians) => {
  context.save()
  context.rotate(radians)

  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(0, -branchHeight)
  context.stroke()

  context.translate(0, -branchHeight)
  branch(branchHeight)
  context.restore()
}

const branch = branchHeight => {
  branchHeight *= heightFactor
  if (branchHeight > branching) {
    drawBranch(branchHeight, theta + direction)
    drawBranch(branchHeight, -theta + direction)
  }
}

draw()
