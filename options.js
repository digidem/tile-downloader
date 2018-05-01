var React = require('react')
var bytes = require('pretty-bytes')
var utils = require('@yaga/tile-utils')
var PropTypes = require('prop-types')

function estimatedSize (IBBox, minZoom, maxZoom) {
  var count = 0
  var bbox = IBBox
  for (let z = minZoom; z <= maxZoom; z += 1) {
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
  return bytes(count * (6 * 1000))
}

export class Options extends React.Component {
  static propTypes = {
    map: PropTypes.object.required,
    IBBox: PropTypes.object,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    url: PropTypes.string,
    onDownloadClick: PropTypes.func.required,
    onCloseClick: PropTypes.func.required
  }

  static defaultProps = {
    IBBox: {},
    minZoom: 0,
    maxZoom: 1,
    url: '',
  }

  constructor (props) {
    super(props)
  }

  render () {
    var IBBox = this.props.IBBox
    if (!IBBox) {
      var bounds = this.props.map.getBounds()
      IBBox = {
        minLng: bounds._sw.lng,
        minLat: bounds._sw.lat,
        maxLng: bounds._ne.lng,
        maxLat: bounds._ne.lat
      }
    }
    var minZoom = this.props.minZoom || map.getZoom()
    var maxZoom = this.props.maxZoom || this.props.minZoom + 1
    return (
      <form id="options" onsubmit=${this.onDownloadClick}>
        <p>Bounding Box</p>
        Min Lng: <input type="text" name="minLng" onchange=${this.handleChange} value=${IBBox.minLng}/>
        <br>
        Min Lat: <input type="text" name="minLat" onchange=${this.handleChange} value=${IBBox.minLat}/>
        <br>
        Max Lng: <input type="text" name="maxLng" onchange=${this.handleChange} value=${IBBox.maxLng} />
        <br>
        Max Lat: <input type="text" name="maxLat" onchange=${this.handleChange} value=${IBBox.maxLat} />
        <br>
        Zoom: <input type="text" name="minZoom" onchange=${this.handleChange} value=${minZoom} />
        <br>
        <p>Estimated Size: ${estimatedSize(IBBox, minZoom, maxZoom)}</p>
        <button onclick=${this.onCloseClick}>Just Kidding</button>
        <button type="submit">Start Downloading</button>
      </form>
    )
  }
}
