var MapboxglLayerControl = require('@digidem/mapbox-gl-layers')
var utils = require('@yaga/tile-utils')
var form = require('get-form-data')
var bytes = require('pretty-bytes')
var StreamSaver = require('streamsaver')
var yo = require('yo-yo')
var mapboxgl = require('mapbox-gl')
var download = require('./download')

var accessToken = 'pk.eyJ1Ijoia3JtY2tlbHYiLCJhIjoiY2lxbHpscXo5MDBlMGdpamZnN21mOXF3MCJ9.BtXlq8OmTEM8fHqWuxicPQ';
mapboxgl.accessToken = accessToken
const bingSource = {
  type: 'raster',
  tiles: [
    'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869'
  ],
  minzoom: 1,
  maxzoom: 21,
  tileSize: 256
}

const bing = {
  id: 'bing',
  type: 'raster',
  source: 'bing',
  layout: {
    visibility: 'visible'
  },
  paint: {
  }
}

var map = new mapboxgl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {'bing': bingSource},
    layers: [bing]
  }
})

map.on('style.load', function () {
  var underlays = [{
    name: 'Bing Satellite',
    ids: ['bing']
  }]

  var layerControl = new MapboxglLayerControl({underlays})
  map.addControl(layerControl, 'bottom-right')
})

var $overlay = document.getElementById('overlay')
$overlay.addEventListener('click', closePreview)
document.body.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closePreview(event)
})
var $controls = document.getElementById('controls')
$controls.addEventListener('click', function (event) {
  event.stopPropagation()
})
var controls = createControls()
$controls.appendChild(controls)

var $buttons = document.getElementById('buttons')
var buttons = createButtons()
$buttons.appendChild(buttons)

map.on('moveend', function () {
  var bbox = getMapBbox()
  var minZoom = Math.round(map.getZoom())
  yo.update(controls, createControls(bbox, minZoom))
})

function getMapBbox (bbox) {
  var bounds = map.getBounds()
  return [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat]
}

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

function downloadClick (event) {
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
      yo.update(controls, yo`<div>Error... <br>${err.toString()}</div>`)
    })
    stream.on('end', function () {
    })
  })
  event.stopPropagation()
  event.preventDefault()
  return false
}

function previewDownload (event) {
  $overlay.style = 'display: block;'
  event.stopPropagation()
  event.preventDefault()
  return false
}

function closePreview (event) {
  $overlay.style = 'display: none;'
  event.stopPropagation()
  event.preventDefault()
  return false
}

function getTileCount (bbox, minZ, maxZ) {
  var acc = 0
  if (!maxZ) maxZ = 0
  for (let z = minZ; z <= maxZ; z += 1) {
    const minX = utils.lng2x(bbox.minLng, z)
    const maxX = utils.lng2x(bbox.maxLng, z)
    const maxY = utils.lat2y(bbox.minLat, z)
    const minY = utils.lat2y(bbox.maxLat, z)
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        acc += 1
      }
    }
  }
  return acc
}

function createControls (bbox, minZoom) {
  if (!bbox) bbox = getMapBbox()
  if (!minZoom) map.getZoom()
  var IBBox = {
    minLng: bbox[0],
    minLat: bbox[1],
    maxLng: bbox[2],
    maxLat: bbox[3]
  }
  var count = getTileCount(IBBox, minZoom)
  return yo`<form id="options" onsubmit=${downloadClick}>
    <p>Bounding Box</p>
    Min Lng: <input type="text" name="minLng" value=${IBBox.minLng}/>
    <br>
    Min Lat: <input type="text" name="minLat" value=${IBBox.minLat}/>
    <br>
    Max Lng: <input type="text" name="maxLng" value=${IBBox.maxLng} />
    <br>
    Max Lat: <input type="text" name="maxLat" value=${IBBox.maxLat} />
    <br>
    Zoom: <input type="text" name="minZoom" value=${minZoom} />
    <br>
    <p>Estimated Size: ${bytes(count * (6 * 1000))}</p>
    <button onclick=${closePreview}>Just Kidding</button>
    <button type="submit">Start Downloading</button>
  </from>`
}

function createButtons () {
  var text = 'Click here to download tiles in this area...'
  if (!StreamSaver.supported) text = 'Please use the latest version of Google Chrome'
  return yo`<div>
    <button onclick=${StreamSaver.supported ? previewDownload : null}>${text}</button>
  </div>`
}
