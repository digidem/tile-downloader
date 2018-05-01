var React = require('react')
var form = require('get-form-data')
var download = require('./download')
var ReactDOM = require('react-dom')
var bytes = require('pretty-bytes')
var utils = require('@yaga/tile-utils')
var PropTypes = require('prop-types')

export default DownloadControl
function DownloadControl (options) {
  if (!(this instanceof DownloadControl)) return new DownloadControl()
  this.options = options || {}
}

function getUrl (source) {
  if (source.tiles) {
    var url = source.tiles[0]
    return url.replace('{quadkey}', '{q}')
  }
  return false
}

DownloadControl.prototype._onDownload = function (data) {
  var map = this._map
  var sources = map.getStyle().sources
  var selected = Object.keys(sources).reduce((acc, k) => {
    if (map.isSourceLoaded(k)) acc.push(k)
    return acc
  }, [])
  var selectedSource = sources[selected[0]]
  var url = getUrl(selectedSource)
  download(url, data, function (stream) {
    // TODO: make download unclickable?
    stream.on('error', function (err) {
      throw err
    })
    stream.on('end', function () {
      // TODO: make download clickable again.
    })
  })
  return false
}

DownloadControl.prototype.onAdd = function (map) {
  this._map = map
  this._map.on('moveend', this._update.bind(this))
  this._container = this._render()
  return this._container
}

DownloadControl.prototype._update = function () {
  var parent = this._container.parentNode
  var newContainer = this._render()
  parent.replaceChild(newContainer, this._container)
  this._container = newContainer
}

DownloadControl.prototype._handleChangeOptions = function (data) {
  console.log(data)
}

DownloadControl.prototype._render = function () {
  var map = this._map
  var el = document.createElement('div')
  el.className = 'mapboxgl-ctrl'
  var bounds = map.getBounds()
  var IBBox = {
    minLng: bounds._sw.lng,
    minLat: bounds._sw.lat,
    maxLng: bounds._ne.lng,
    maxLat: bounds._ne.lat
  }
  var onDownload = this.options.onDownload || this._onDownload.bind(this)

  ReactDOM.render(<Options
    IBBox={IBBox}
    minZoom={map.getZoom()}
    onChange={this._handleChangeOptions}
    onDownload={onDownload} />,
  el)
  return el
}

DownloadControl.prototype.onRemove = function () {
  this._container = null
}

class Options extends React.Component {
  static propTypes = {
    onDownload: PropTypes.func.isRequired,
    IBBox: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    url: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = this.props
  }

  onDownloadClick (event) {
    var data = form.default(event.target)
    Object.keys(data).map(function (key) {
      data[key] = Number(data[key])
    })
    this.state.onDownload(data)
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  _keyPress (event) {
    if (event.key === 'Enter') {
      console.log(this.state)
      debugger
    }
  }

  estimatedSize (IBBox, minZoom, maxZoom) {
    var count = 0
    var bbox = IBBox
    for (let z = minZoom; z <= maxZoom; z += 1) {
      const minX = utils.lng2x(bbox.minLng, z)
      const maxX = utils.lng2x(bbox.maxLng, z)
      const maxY = utils.lat2y(bbox.minLat, z)
      const minY = utils.lat2y(bbox.maxLat, z)
      for (let x = minX; x <= maxX; x += 1) {
        for (let y = minY; y <= maxY; y += 1) {
          count += 1
        }
      }
    }
    return bytes(count * (6 * 1000))
  }

  render () {
    var IBBox = this.state.IBBox
    var minZoom = Math.round(this.state.minZoom || 0)
    var maxZoom = Math.round(this.state.maxZoom || this.state.minZoom + 1)

    var keyPress = this._keyPress.bind(this)
    return (
      <form id="options" onSubmit={this.onDownloadClick.bind(this)}>
        <p>Bounding Box</p>
        <Input label='Min Long' name='minLng' onKeyPress={this.keyPress} defaultValue={IBBox.minLng} />
        <Input label='Min Lat' name='minLat' onKeyPress={this.keyPress} defaultValue={IBBox.minLat} />
        <Input label='Max Long' name='maxLng' onKeyPress={this.keyPress} defaultValue={IBBox.maxLng} />
        <Input label='Max Lat' name='maxLat' onKeyPress={this.keyPress} defaultValue={IBBox.maxLat} />
        <Input label='Min Zoom' name='minZoom' onKeyPress={this.keyPress} defaultValue={minZoom} />
        <Input label='Max Zoom' name='maxZoom' onKeyPress={this.keyPress} defaultValue={maxZoom} />
        <div>
        <p>Estimated Size: {this.estimatedSize(IBBox, minZoom, maxZoom)}</p>
        <button type="submit">Start Downloading</button>
        </div>
      </form>
    );
  }
}

function Input (props) {
  return (
    <div>
      {props.label} <input type="text" name={props.name} onKeyPress={props.onKeyPress} defaultValue={props.defaultValue} />
    </div>
  )
}
