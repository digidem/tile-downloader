const tilelive = require('tilelive-streaming')(require('@mapbox/tilelive'))
const StreamSaver = require('streamsaver')
require('tilelive-http')(tilelive)
require('@mapbox/tilejson').registerProtocols(tilelive)
require('tilelive-tar').registerProtocols(tilelive)

/**
* Download tile data given a query.
*/

module.exports = function (url, data, cb) {
  tilelive.load(url, function (err, source) {
    if (err) throw err
    tilelive.load('tar://tiles.png', function (err, sink) {
      if (err) throw err
      var fileStream = StreamSaver.createWriteStream('tiles.tar')
      var writer = fileStream.getWriter()
      sink.pack.on('data', function (data) {
        writer.write(data)
      })
      var bounds = [data.minLng, data.minLat, data.maxLng, data.maxLat]
      var stream = source.createReadStream({
        minzoom: data.minZoom,
        maxzoom: data.maxZoom,
        bounds: bounds
      }).pipe(sink.createWriteStream())

      stream.on('end', function () {
        writer.close()
      })
      cb(stream)
    })
  })
}
