import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import Button from '../../../components/Button'
import SafeAreaBox from '../../../components/SafeAreaBox'
import Text from '../../../components/Text'
import usePermissionManager from '../../../utils/usePermissionManager'
import { HotspotSetupNavigationProp } from './hotspotSetupTypes'
import LocationPin from '../../../assets/images/location-pin.svg'
import Box from '../../../components/Box'
import { ww } from '../../../utils/layout'

const HotspotSetupLocationInfoScreen = () => {
  const { t } = useTranslation()
  const { requestLocationPermission } = usePermissionManager()
  const navigation = useNavigation<HotspotSetupNavigationProp>()
  const checkLocationPermissions = async () => {
    const enabled = await requestLocationPermission()
    if (enabled) {
      navigation.navigate('HotspotSetupPickLocationScreen')
    }
  }

  return (
    <Box flex={1}>
      <Box position="relative" height={290} backgroundColor="primaryBackground">
        <Image
          style={{ position: 'absolute', left: -(ww - 585 / 2) }}
          source={require('../../../assets/images/world.png')}
        />
      </Box>
      <SafeAreaBox
        flex={1}
        edges={['bottom']}
        backgroundColor="primaryBackground"
        padding="l"
      >
        <Box flex={1}>
          <Box marginBottom="m">
            <LocationPin />
          </Box>
          <Text variant="h1" marginBottom="m">
            {t('hotspot_setup.enable_location.title')}
          </Text>
          <Text variant="subtitle" marginBottom="l">
            {t('hotspot_setup.enable_location.subtitle')}
          </Text>
          <Text variant="body1Light">
            {t('hotspot_setup.enable_location.p_1')}
          </Text>
        </Box>
        <Button
          onPress={checkLocationPermissions}
          variant="primary"
          mode="contained"
          title={t('hotspot_setup.enable_location.next')}
        />
      </SafeAreaBox>
    </Box>
  )
}

export default HotspotSetupLocationInfoScreen
