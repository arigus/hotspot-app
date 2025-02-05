import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Hotspot, HotspotRewardSum } from '@helium/http'
import BottomSheet from 'react-native-holy-sheet/src/index'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import Balance, { CurrencyType } from '@helium/currency'
import Text from '../../../components/Text'
import Box from '../../../components/Box'
import TouchableOpacityBox from '../../../components/TouchableOpacityBox'
import Add from '../../../assets/images/add.svg'
import { hp } from '../../../utils/layout'
import { getHotspotRewardsSum } from '../../../utils/appDataClient'
import HotspotsCarousel from '../../../components/HotspotsCarousel'
import Map from '../../../components/Map'
import { hotspotsToFeatures } from '../../../utils/mapUtils'
import { RootNavigationProp } from '../../../navigation/main/tabTypes'

type Props = {
  ownedHotspots: Hotspot[]
}

const TimeOfDayHeader = ({ date }: { date: Date }) => {
  const { t } = useTranslation()
  const hours = date.getHours()
  let timeOfDay = t('time.afternoon')
  if (hours >= 4 && hours < 12) {
    timeOfDay = t('time.morning')
  }
  if (hours >= 17 || hours < 4) {
    timeOfDay = t('time.evening')
  }
  return <Text variant="h1">{t('time.day_header', { timeOfDay })}</Text>
}

const HotspotsView = ({ ownedHotspots }: Props) => {
  const navigation = useNavigation<RootNavigationProp>()
  const dragMid = hp(40)
  const dragMax = hp(75)
  const dragMin = 40
  const { t } = useTranslation()
  const [focusedHotspot, setFocusedHotspot] = useState(ownedHotspots[0])

  const [date, setDate] = useState(new Date())
  useEffect(() => {
    const dateTimer = setInterval(() => setDate(new Date()), 300000) // update every 5 min
    return () => clearInterval(dateTimer)
  })

  const [hotspotRewards, setHotspotRewards] = useState({})
  const [totalRewards, setTotalRewards] = useState(
    new Balance(0, CurrencyType.networkToken),
  )
  useEffect(() => {
    const fetchRewards = async () => {
      let total = new Balance(0, CurrencyType.networkToken)
      const rewards: Record<string, HotspotRewardSum> = {}
      const results = await Promise.all(
        ownedHotspots.map((hotspot) =>
          getHotspotRewardsSum(hotspot.address, 1),
        ),
      )
      results.forEach((reward, i) => {
        const { address } = ownedHotspots[i]
        rewards[address] = reward
        total = total.plus(reward.total)
      })
      setHotspotRewards(rewards)
      setTotalRewards(total)
    }
    fetchRewards()
  }, [ownedHotspots, date])

  const snapProgress = useSharedValue(dragMid / dragMax)

  const opacity = useDerivedValue(() => {
    return interpolate(
      snapProgress.value,
      [dragMid / dragMax, dragMin / dragMax],
      [1, 0],
      Extrapolate.CLAMP,
    )
  })

  const translateY = useDerivedValue(() => {
    return interpolate(
      snapProgress.value,
      [dragMid / dragMax, dragMin / dragMax],
      [0, dragMid - dragMin],
      Extrapolate.CLAMP,
    )
  })

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    }
  })

  const onHotspotFocused = (hotspot: Hotspot) => {
    setFocusedHotspot(hotspot)
  }

  const ownedHotspotFeatures = hotspotsToFeatures(ownedHotspots)

  return (
    <Box flex={1} flexDirection="column" justifyContent="space-between">
      <Box
        position="absolute"
        height="100%"
        width="100%"
        borderTopLeftRadius="xl"
        borderTopRightRadius="xl"
        style={{ marginTop: 70 }}
        overflow="hidden"
      >
        <Map
          ownedHotspots={ownedHotspotFeatures}
          zoomLevel={14}
          mapCenter={[focusedHotspot.lng || 0, focusedHotspot.lat || 0]}
          animationMode="flyTo"
          offsetCenterRatio={1.5}
        />
      </Box>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="primaryBackground"
        padding="m"
      >
        <Text variant="h3">{t('hotspots.owned.title')}</Text>

        <Box flexDirection="row" justifyContent="space-between">
          {/* TODO: Hotspot Search */}
          {/* <TouchableOpacityBox padding="s"> */}
          {/*  <Search width={22} height={22} /> */}
          {/* </TouchableOpacityBox> */}
          <TouchableOpacityBox
            onPress={() => navigation.push('HotspotSetup')}
            padding="s"
          >
            <Add width={22} height={22} />
          </TouchableOpacityBox>
        </Box>
      </Box>

      <Animated.View style={animatedStyles}>
        <Box padding="l" style={{ marginBottom: dragMid }}>
          <TimeOfDayHeader date={date} />
          <Text variant="body1" paddingTop="m">
            {t('hotspots.owned.reward_summary', {
              count: ownedHotspots.length,
              hntAmount: totalRewards.toString(2),
            })}
          </Text>
        </Box>
      </Animated.View>

      <BottomSheet
        containerStyle={{ paddingLeft: 0, paddingRight: 0 }}
        snapPoints={[dragMin, dragMid, dragMax]}
        initialSnapIndex={1}
        snapProgress={snapProgress}
      >
        <HotspotsCarousel
          hotspots={ownedHotspots}
          rewards={hotspotRewards}
          onHotspotFocused={onHotspotFocused}
        />
      </BottomSheet>
    </Box>
  )
}

export default HotspotsView
