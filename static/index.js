var form = require('get-form-data')
var normalizeSourceURL = require('mapbox-style-downloader/lib/mapbox').normalizeSourceURL
var StreamSaver = require('streamsaver')
var yo = require('yo-yo')
var mapboxgl = require('mapbox-gl')
var download = require('./download')

var accessToken = 'pk.eyJ1Ijoia3JtY2tlbHYiLCJhIjoiY2lxbHpscXo5MDBlMGdpamZnN21mOXF3MCJ9.BtXlq8OmTEM8fHqWuxicPQ';

var maxZoom = 8

mapboxgl.accessToken = accessToken
const userSource = {
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

const user = {
  id: 'user-tile',
  type: 'raster',
  source: 'user-tile',
  layout: {
    visibility: 'visible'
  },
  paint: {
  }
}

// TODO: let user pick url source
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v9'
})

map.on('style.load', function () {
  map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none')
  map.addSource('user-tile', userSource)
  map.addLayer(user)
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
  var el = document.querySelector('form')
  var data = form.default(el)
  Object.keys(data).map(function (key) {
    data[key] = Number(data[key])
  })
  return data
}

function downloadClick (event) {
  var url = normalizeSourceURL('mapbox://mapbox.satellite', accessToken)
  var data = getFormData()
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

function createControls (bbox, minZoom) {
  if (!bbox) bbox = getMapBbox()
  if (!minZoom) map.getZoom()
  var maxZoomEl = document.querySelector('input[name="maxZoom"]')
  if (maxZoomEl) maxZoom = maxZoomEl.value
  return yo`<form onsubmit=${downloadClick}>
    <p>Bounding Box</p>
    Min Lng: <input type="text" name="minLng" value=${bbox[0]}/>
    <br>
    Min Lat: <input type="text" name="minLat" value=${bbox[1]}/>
    <br>
    Max Lng: <input type="text" name="maxLng" value=${bbox[2]} />
    <br>
    Max Lat: <input type="text" name="maxLat" value=${bbox[3]} />
    <br>
    <p>Zoom Range</p>
    Min Zoom: <input type="text" name="minZoom" value=${minZoom} />
    <br>
    Max Zoom: <input type="text" name="maxZoom" value=${maxZoom} />
    <br>
    <p>Estimated Size: TODO</p>
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
