var ReactDOM = require('react-dom')
var MapboxglLayerControl = require('@digidem/mapbox-gl-layers')
var form = require('get-form-data')
var yo = require('yo-yo')
var mapboxgl = require('mapbox-gl')
var download = require('./download')
var App = require('./app')

ReactDOM.render(
  <App />,
  document.querySelector('body')
)


var $overlay = document.getElementById('overlay')
$overlay.addEventListener('click', closePreview)
document.body.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closePreview(event)
})
var $controls = document.getElementById('controls')
$controls.addEventListener('click', function (event) {
  event.stopPropagation()
})

var $buttons = document.getElementById('buttons')
var buttons = createButtons()
$buttons.appendChild(buttons)

map.on('moveend', function () {
  var bbox = getMapBbox()
  var minZoom = Math.round(map.getZoom())
  yo.update(controls, createControls(bbox, minZoom))
})

function getFormData () {
  var el = document.querySelector('form#options')
  var data = form.default(el)
  Object.keys(data).map(function (key) {
    data[key] = Number(data[key])
  })
  return data
}

function getUrl (source) {
  if (source.tiles) {
    var url = source.tiles[0]
    return url.replace('{quadkey}', '{q}')
  }
  return false
}

function onDownloadClick (event) {
  var sources = map.getStyle().sources
  var selected = Object.keys(sources).reduce((acc, k) => {
    if (map.isSourceLoaded(k)) acc.push(k)
    return acc
  }, [])
  var selectedSource = sources[selected[0]]
  var data = getFormData()
  var url = getUrl(selectedSource)
  download(url, data, function (stream) {
    closePreview(event)
    stream.on('error', function (err) {
      throw err
    })
    stream.on('end', function () {
    })
  })
  event.stopPropagation()
  event.preventDefault()
  return false
}

function createButtons () {
}
