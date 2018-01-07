const jimp = require('jimp')
const args = require('command-line-args')
const fs = require('fs')
const lum = require('relative-luminance')

const gcode = fs.createWriteStream('image.gcode')
const options = args([
  { name: 'x-mm', alias: 'x', type: Number },
  { name: 'y-mm', alias: 'y', type: Number },
  { name: 'min-power', type: Number, defaultValue: 0 },
  { name: 'max-power', type: Number, defaultValue: 255 },
  { name: 'resolution', alias: 'r', defaultValue: 0.1, type: Number },
  { name: 'min-linger', type: Number, defaultValue: 0 },
  { name: 'max-linger', type: Number, defaultValue: 5000 },
  { name: 'threshold', type: Number, defaultValue: 0.01 }
])
const deltaLinger = options['max-linger'] - options['min-linger']
const deltaPower = options['max-power'] - options['min-power']

function writeLine(file, line) {
  file.write(line + '\n')
}

jimp.read(process.argv[2], (error, image) => {
  image.scaleToFit(
    options['x-mm'] / options.resolution, 
    options['y-mm'] / options.resolution,
    jimp.RESIZE_BICUBIC
  )

  image.greyscale()

  writeLine(gcode, 'G91')
  writeLine(gcode, 'G0 Z1.0 F500')
  writeLine(gcode, 'G90')
  writeLine(gcode, 'G28')
  writeLine(gcode, 'G92 X-31.4 Y-52.5')
  writeLine(gcode, 'G0 X0 Y0 Z0 F3000')
  writeLine(gcode, 'M201 X3000 Y3000')
  writeLine(gcode, 'M205 X15 Y15')

  writeLine(gcode, '')

  writeLine(gcode, 'M106 S1')
  writeLine(gcode, 'G0 Y' + image.bitmap.height * options.resolution)
  writeLine(gcode, 'G0 X' + image.bitmap.width * options.resolution)
  writeLine(gcode, 'G0 Y0')
  writeLine(gcode, 'G0 X0')
  writeLine(gcode, 'M107')

  writeLine(gcode, '')

  for (var y = image.bitmap.height; y >= 0; y--) {
    writeLine(gcode, 'G0 Y' + ((image.bitmap.height - y) * options.resolution).toFixed(3))

    for (var x0 = 0; x0 < image.bitmap.width; x0++) {
      var x = y % 2 ? image.bitmap.width - x0 - 1 : x0

      var idx = image.getPixelIndex(x, y)

      var r = image.bitmap.data[idx + 0]
      var g = image.bitmap.data[idx + 1]
      var b = image.bitmap.data[idx + 2]


      //process.exit()
      //var luminesce = (1 - lum([r, g, b])) * (image.bitmap.data[idx + 3] / 255)
      var luminesce = (1 - r / 255) * (image.bitmap.data[idx + 3] / 255)
      var linger = Math.round(luminesce * deltaLinger)
      var power = Math.round(luminesce * deltaPower)
      var gray = 255 * (1 - luminesce)

      if (luminesce > options.threshold) {
        image.bitmap.data[idx + 0] = gray
        image.bitmap.data[idx + 1] = gray
        image.bitmap.data[idx + 2] = gray

        writeLine(gcode, 'G0 X' + (x * options.resolution).toFixed(3))
        writeLine(gcode, 'M106 S' + (power + options['min-power']) + ' U' + (linger + options['min-linger']))
        // writeLine(gcode, 'G4 U' + (linger + options['min-linger']))
        // writeLine(gcode, 'M107')
      } else {
        image.bitmap.data[idx + 0] = 255
        image.bitmap.data[idx + 1] = 255
        image.bitmap.data[idx + 2] = 255
      }

      image.bitmap.data[idx + 3] = 255
    }
  }

  writeLine(gcode, 'G0 X0 Y0')
  writeLine(gcode, 'M18')

  image.greyscale()
  image.write('test-output.png')
})

