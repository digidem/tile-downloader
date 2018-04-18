var form = require('get-form-data')
var yo = require('yo-yo')
var mapboxgl = require('mapbox-gl')
var download = require('./download')

mapboxgl.accessToken = 'pk.eyJ1Ijoia3JtY2tlbHYiLCJhIjoiY2lxbHpscXo5MDBlMGdpamZnN21mOXF3MCJ9.BtXlq8OmTEM8fHqWuxicPQ';

var maxZoom = 8

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9'
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
  var data = getFormData()
  download(data)
  console.log('got', data)
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
    <input type="text" name="minZoom" value=${minZoom} />
    <input type="text" name="maxZoom" value=${maxZoom} />
    <br>
    <p>Estimated Size: TODO</p>
    <button onclick=${closePreview}>Just Kidding</button>
    <button type="submit">Start Downloading</button>
  </from>`
}

function flyToCoordinates (data) {
  map.fitBounds([[data.minLng, data.minLat], [data.maxLng, data.maxLat]])
  map.setZoom(data.minZoom)
}

function createButtons () {
  return yo`<div>
    <button onclick=${previewDownload}>Ready to Download Tiles? Click here to preview...</button>
  </div>`
}
