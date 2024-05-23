// GENERATE BY script
// DON NOT EDIT IT MANUALLY

import * as React from 'react'
import data from './DefaultToolIcon.json'
import IconBase from '@/icons/IconBase'
import type { IconBaseProps, IconData } from '@/icons/IconBase'

const Icon = React.forwardRef<React.MutableRefObject<SVGElement>, Omit<IconBaseProps, 'data'>>((
  props,
  ref,
) => <IconBase {...props} ref={ref} data={data as unknown as IconData} />)

Icon.displayName = 'DefaultToolIcon'

export default Icon
