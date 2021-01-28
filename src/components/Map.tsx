import React, { useRef, useState, useEffect, useCallback } from 'react'
import MapboxGL, {
  OnPressEvent,
  RegionPayload,
} from '@react-native-mapbox-gl/maps'
import { Feature, Point, Position } from 'geojson'
import { BoxProps } from '@shopify/restyle'
import Box from './Box'
import CurrentLocationButton from './CurrentLocationButton'
import { Theme } from '../theme/theme'

const styleURL = 'mapbox://styles/petermain/ckjtsfkfj0nay19o3f9jhft6v'

type Props = BoxProps<Theme> & {
  onMapMoved?: (coords?: Position) => void
  onDidFinishLoadingMap?: (latitude: number, longitude: number) => void
  onMapMoving?: (feature: Feature<Point, RegionPayload>) => void
  currentLocationEnabled?: boolean
  zoomLevel?: number
  mapCenter?: number[]
  ownedHotspots?: Feature[]
  selectedHotspots?: Feature[]
  witnesses?: Feature[]
  animationMode?: 'flyTo' | 'easeTo' | 'moveTo'
  animationDuration?: number
  offsetCenterRatio?: number
  maxZoomLevel?: number
  minZoomLevel?: number
  interactive?: boolean
  showUserLocation?: boolean
}
const Map = ({
  onMapMoved,
  onDidFinishLoadingMap,
  onMapMoving,
  currentLocationEnabled,
  zoomLevel,
  mapCenter = [0, 0],
  animationMode = 'moveTo',
  animationDuration = 500,
  ownedHotspots,
  selectedHotspots,
  witnesses,
  offsetCenterRatio,
  showUserLocation,
  maxZoomLevel = 16,
  minZoomLevel = 0,
  interactive = true,
  ...props
}: Props) => {
  const map = useRef<MapboxGL.MapView>(null)
  const camera = useRef<MapboxGL.Camera>(null)
  const [loaded, setLoaded] = useState(false)
  const [userCoords, setUserCoords] = useState({ latitude: 0, longitude: 0 })
  const [centerOffset, setCenterOffset] = useState(0)

  const onRegionDidChange = async () => {
    if (onMapMoved) {
      const center = await map.current?.getCenter()
      onMapMoved(center)
    }
  }

  const centerUserLocation = () => {
    camera.current?.setCamera({
      centerCoordinate: userCoords
        ? [userCoords.longitude, userCoords.latitude]
        : [-98.35, 15],
      zoomLevel: userCoords ? 16 : 2,
      animationDuration: 500,
      heading: 0,
    })
  }
  const flyTo = useCallback(
    (lat?: number, lng?: number) => {
      if (!lat || !lng) return
      camera.current?.flyTo([lng, lat - centerOffset], animationDuration)
    },
    [animationDuration, centerOffset],
  )

  useEffect(() => {
    if (!showUserLocation || !userCoords.latitude || !userCoords.longitude)
      return

    flyTo(userCoords.latitude, userCoords.longitude)
  }, [flyTo, showUserLocation, userCoords])

  const onDidFinishLoad = () => {
    setLoaded(true)
  }

  const onShapeSourcePress = (event: OnPressEvent) => {
    const { properties } = event.features[0]
    flyTo(properties?.lat, properties?.lng)
  }

  useEffect(() => {
    if (loaded && userCoords) {
      onDidFinishLoadingMap?.(userCoords.latitude, userCoords.longitude)
    }
    const calculateOffset = async () => {
      const bounds = await map?.current?.getVisibleBounds()
      const center = await map?.current?.getCenter()
      if (bounds && center) {
        const topLat = bounds[0][1]
        const centerLat = center[1]
        const scale = offsetCenterRatio || 1
        setCenterOffset((topLat - centerLat) / scale)
      }
    }
    if (offsetCenterRatio) {
      setTimeout(calculateOffset, animationDuration)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, loaded, offsetCenterRatio])

  const mapImages = {
    markerOwned: require('../assets/images/owned-hotspot-marker.png'),
    markerSelected: require('../assets/images/selected-hotspot-marker.png'),
    markerWitness: require('../assets/images/witness-marker.png'),
    markerLocation: require('../assets/images/locationPurple.png'),
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Box {...props}>
      <MapboxGL.MapView
        ref={map}
        onRegionDidChange={onRegionDidChange}
        onRegionWillChange={onMapMoving}
        onDidFinishLoadingMap={onDidFinishLoad}
        styleURL={styleURL}
        style={{ width: '100%', height: '100%', borderRadius: 40 }}
        logoEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        compassEnabled={false}
      >
        {(showUserLocation || currentLocationEnabled) && (
          <MapboxGL.UserLocation
            onUpdate={(loc) => {
              if (
                !loc?.coords ||
                (userCoords.latitude && userCoords.longitude)
              ) {
                return
              }

              setUserCoords(loc.coords)
            }}
          >
            <MapboxGL.SymbolLayer
              id="markerLocation"
              style={{
                iconImage: 'markerLocation',
                iconOffset: [0, -25 / 2],
              }}
            />
          </MapboxGL.UserLocation>
        )}
        <MapboxGL.Camera
          ref={camera}
          zoomLevel={zoomLevel}
          maxZoomLevel={maxZoomLevel}
          minZoomLevel={minZoomLevel}
          animationMode={animationMode}
          animationDuration={animationDuration}
          centerCoordinate={[mapCenter[0], mapCenter[1] - centerOffset]}
        />
        <MapboxGL.Images images={mapImages} />
        {ownedHotspots && (
          <MapboxGL.ShapeSource
            id="ownedHotspots"
            shape={{ type: 'FeatureCollection', features: ownedHotspots }}
            onPress={onShapeSourcePress}
          >
            <MapboxGL.SymbolLayer
              id="markerOwned"
              style={{
                iconImage: 'markerOwned',
                iconAllowOverlap: true,
                iconSize: 1,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
        {witnesses && (
          <MapboxGL.ShapeSource
            id="witnesses"
            shape={{ type: 'FeatureCollection', features: witnesses }}
            onPress={onShapeSourcePress}
          >
            <MapboxGL.SymbolLayer
              id="markerWitness"
              style={{
                iconImage: 'markerWitness',
                iconAllowOverlap: true,
                iconSize: 1,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
        {selectedHotspots && (
          <MapboxGL.ShapeSource
            id="selectedHotspots"
            shape={{ type: 'FeatureCollection', features: selectedHotspots }}
            onPress={onShapeSourcePress}
          >
            <MapboxGL.SymbolLayer
              id="markerSelected"
              style={{
                iconImage: 'markerSelected',
                iconAllowOverlap: true,
                iconSize: 1,
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
      {currentLocationEnabled && (
        <CurrentLocationButton onPress={centerUserLocation} />
      )}
    </Box>
  )
}

export default Map
