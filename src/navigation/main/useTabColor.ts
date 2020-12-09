import { useColors } from '../../theme/themeHooks'
import { MainTabType } from './tabTypes'

export default (name: MainTabType, focused: boolean) => {
  const { blueLight, grayBlue, green, purple, white } = useColors()
  if (!focused) return grayBlue

  if (name === 'Hotspots') return blueLight
  if (name === 'Account') return green
  if (name === 'Network') return purple
  return white
}