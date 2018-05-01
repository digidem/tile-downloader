var React = require('react')
var Options = require('./options')
var StreamSaver = require('streamsaver')

export class App extends React.Component {
  static defaultProps = {
    showOverlay: false,
    map: null
  }

  constructor (props) {
    super(props)

  }
  componentDidMount () {
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
  }

  previewDownload () {

  }

  render () {
    var text = 'Click here to download tiles in this area...'
    if (!StreamSaver.supported) text = 'Please use the latest version of Google Chrome'
    return <body onclick={this.closePreview}>
      <div id='bar' class='top'>
        <div id='bar-inner'>
          <div id='buttons'>
            <button onclick={StreamSaver.supported ? this.previewDownload : null}>{text}</button>
          </div>
        </div>
      </div>
      {!this.showOverlay ? '' : <div id='overlay'><Options map={this.map}/> </div>}
      <div id="map"></div>
      <div id='attribution' class='bottom'>
        <a target='_blank' href='http://github.com/karissa/tile-download-ui'>
          <img src='/static/github.png' />
        </a>
      </div>
    </body>
  }
}
