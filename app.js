import DownloadControl from 'mbgl-dl-ctrl'
import MapboxglLayerControl from '@digidem/mapbox-gl-layers'
import mapboxgl from 'mapbox-gl'
import React from 'react'
import styled from 'styled-components'

const Unsupported = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .text {
    text-align: center;
    padding: 50px;
    margin: auto;
    background-color: rgb(248, 215, 218);
  }
`

const Style = styled.div`
  .github-corner:hover .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
  @keyframes octocat-wave {
    0%,
    100% {
      transform: rotate(0);
    }
    20%,
    60% {
      transform: rotate(-25deg);
    }
    40%,
    80% {
      transform: rotate(10deg);
    }
  }
  @media (max-width: 500px) {
    .github-corner:hover .octo-arm {
      animation: none;
    }
    .github-corner .octo-arm {
      animation: octocat-wave 560ms ease-in-out;
    }
  }
`

export default class App extends React.Component {
  componentDidMount () {
    if (!document.getElementById('map')) return
    var accessToken = 'pk.eyJ1Ijoia3JtY2tlbHYiLCJhIjoiY2lxbHpscXo5MDBlMGdpamZnN21mOXF3MCJ9.BtXlq8OmTEM8fHqWuxicPQ'
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
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (!('caches' in window) || typeof ReadableStream === 'undefined' || isSafari) {
      return <Unsupported>
       <div className='text'>
        Sorry, Tile Downloader isn't currently supported by your browser. Google Chrome should work.
        </div>
      </Unsupported>
    }

    return (
      <Style>
      <div id="map"></div>
    </Style>
  )
  }
}
