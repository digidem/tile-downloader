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

var $controls = document.getElementById('controls')
var controls = createControls()
$controls.appendChild(controls)

var $buttons = document.getElementById('buttons')
var buttons = createButtons()
$buttons.appendChild(buttons)

map.on('moveend', function () {
  var bbox = getMapBbox()
  var minZoom = Math.round(map.getZoom())
  yo.update($controls, createControls(bbox, minZoom))
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

function onclick (event) {
  var data = getFormData()
  download(data)
  event.stopPropagation()
  event.preventDefault()
  return false
}

function flyToClick () {
  $controls.setAttribute('style', 'display: block;')
}

function updateView (event) {
  var data = getFormData()
  map.fitBounds([[data.minLng, data.minLat], [data.maxLng, data.maxLat]])
  map.setZoom(data.minZoom)
  event.stopPropagation()
  event.preventDefault()
  $controls.setAttribute('style', 'display: none;')
  return false
}

function createControls (bbox, minZoom) {
  if (!bbox) bbox = [0, 0, 0, 0]
  if (!minZoom) minZoom = map.getZoom()
  var maxZoomEl = document.querySelector('input[name="maxZoom"]')
  if (maxZoomEl) maxZoom = maxZoomEl.value
  return yo`<form onsubmit="${onclick}">
    <h3>Bounding Box</h3>
    <input type="text" name="minLng" value=${bbox[0]}/>
    <input type="text" name="minLat" value=${bbox[1]}/>
    <input type="text" name="maxLng" value=${bbox[2]} />
    <input type="text" name="maxLat" value=${bbox[3]} />
    <br>
    <input type="text" name="minZoom" value=${minZoom} />
    <input type="text" name="maxZoom" value=${maxZoom} />
    <button onclick=${updateView}>OK</button>
  </from>`
}

function createButtons () {
  return yo`<div>
    <button onclick=${flyToClick}>Fly To Coordinates...</button>
    <button type="submit">Download Tiles</button>
  </div>`
}
