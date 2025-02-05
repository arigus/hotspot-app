import React, { useRef, ElementRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
  useSharedValue,
  useDerivedValue,
  interpolate,
  Extrapolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import BarChart from '../../../components/BarChart'
import Search from '../../../assets/images/search.svg'
import Qr from '../../../assets/images/qr.svg'
import BalanceCard from './BalanceCard'
import ActivityCard from './ActivityCard'
import {
  withWalletLayout,
  WalletAnimationPoints,
  WalletLayout,
} from './walletLayout'
import { triggerNavHaptic } from '../../../utils/haptic'
import TouchableOpacityBox from '../../../components/TouchableOpacityBox'

type Props = {
  layout: WalletLayout
  animationPoints: WalletAnimationPoints
}

const WalletView = ({ layout, animationPoints }: Props) => {
  const { dragMax, dragMid } = animationPoints

  const { t } = useTranslation()

  const navigation = useNavigation()

  const handlePress = () => {
    triggerNavHaptic()
  }

  const navScan = () => {
    triggerNavHaptic()
    navigation.navigate('Scan')
  }

  type ActivityCardHandle = ElementRef<typeof ActivityCard>
  const card = useRef<ActivityCardHandle>(null)

  const handleSendPress = () => {
    triggerNavHaptic()
    navigation.navigate('Send')
  }

  const snapProgress = useSharedValue(dragMid / dragMax)

  const balanceTranslateY = useDerivedValue(() => {
    return interpolate(
      snapProgress.value,
      [dragMid / dragMax, 1],
      [0, -layout.chartHeight],
      Extrapolate.CLAMP,
    )
  })

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: balanceTranslateY.value,
        },
      ],
    }
  })

  const animateActivityToBottom = () => {
    card.current?.snapTo(0)
    triggerNavHaptic()
  }

  return (
    <Box flex={1} style={{ paddingTop: layout.notchHeight }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="l"
        backgroundColor="primaryBackground"
        zIndex={1}
        height={layout.headerHeight}
      >
        <Text variant="h1" fontSize={22}>
          {t('wallet.title')}
        </Text>

        <Box flexDirection="row" justifyContent="space-between" width={85}>
          <TouchableOpacityBox onPress={handlePress} padding="s">
            <Search width={22} height={22} />
          </TouchableOpacityBox>
          <TouchableOpacityBox onPress={navScan} padding="s">
            <Qr width={22} height={22} color="white" />
          </TouchableOpacityBox>
        </Box>
      </Box>

      <Box paddingHorizontal="l">
        <BarChart height={layout.chartHeight} />
      </Box>

      <Animated.View style={[{ flex: 1 }, animatedStyles]}>
        <BalanceCard
          onReceivePress={animateActivityToBottom}
          onSendPress={handleSendPress}
        />
      </Animated.View>

      <ActivityCard
        ref={card}
        animationPoints={animationPoints}
        snapProgress={snapProgress}
      />
    </Box>
  )
}

export default memo(withWalletLayout(WalletView))
