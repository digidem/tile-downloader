import DownloadControl from 'mbgl-dl-ctrl'
import MapboxglLayerControl from '@digidem/mapbox-gl-layers'
import mapboxgl from 'mapbox-gl'
import React from 'react'
import StreamSaver from 'streamsaver'

export default class App extends React.Component {
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
      var downloadControl = new DownloadControl()
      map.addControl(downloadControl, 'bottom-left')
    })

  }

  render () {
    var text = 'Click here to download tiles in this area...'
    if (!StreamSaver.supported) text = 'Please use the latest version of Google Chrome'
    return (
    <div>
      <div id='bar' className='top'>
        <div id='bar-inner'>
          {StreamSaver.supported ? '' : <div id='buttons'>{text}</div>}
        </div>
      </div>
      <div id="map"></div>
      <div id='attribution' className='bottom'>
        <a target='_blank' href='http://github.com/karissa/tile-download-ui'>
          <img src='github.png' />
        </a>
      </div>
    </div>
  )
  }
}
