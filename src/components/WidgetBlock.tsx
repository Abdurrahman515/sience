import type { WidgetSpec } from '../content/types'
import { SortWidget } from './widgets/SortWidget'
import { OrderWidget } from './widgets/OrderWidget'
import { BalanceSim, MohsSim, PlatesSim } from './widgets/EarthSims'
import { MoonSim, SeasonsSim } from './widgets/SpaceSims'
import { MoleculeBuilder } from '../lab/benches2'
import { PlanetOrbits } from '../lab/benches4'
import { FoodWebBuilder } from '../lab/benches6'
import { LeverSim, PulleySim, ScrewSim, WedgeSim, WheelSim } from './widgets/MachineSims'
import { AtomSim, DensitySim, ForceSim, RampSim, SpeedSim, StatesSim } from './widgets/Sims'

interface Props {
  spec: WidgetSpec
  onDone: (stats: { items: number; firstTry: number }) => void
  onSimDone: () => void
}

export function WidgetBlock({ spec, onDone, onSimDone }: Props) {
  switch (spec.kind) {
    case 'sort':
      return <SortWidget spec={spec} onDone={onDone} />
    case 'order':
      return <OrderWidget spec={spec} onDone={onDone} />
    case 'speed':
      return <SpeedSim spec={spec} onDone={onSimDone} />
    case 'force':
      return <ForceSim spec={spec} onDone={onSimDone} />
    case 'ramp':
      return <RampSim spec={spec} onDone={onSimDone} />
    case 'lever':
      return <LeverSim spec={spec} onDone={onSimDone} />
    case 'pulley':
      return <PulleySim spec={spec} onDone={onSimDone} />
    case 'wheel':
      return <WheelSim spec={spec} onDone={onSimDone} />
    case 'wedge':
      return <WedgeSim spec={spec} onDone={onSimDone} />
    case 'screw':
      return <ScrewSim spec={spec} onDone={onSimDone} />
    case 'molecules':
      return <MoleculeBuilder onDone={onSimDone} />
    case 'foodweb':
      return <FoodWebBuilder onDone={onSimDone} />
    case 'orbits':
      return <PlanetOrbits onDone={onSimDone} />
    case 'density':
      return <DensitySim spec={spec} onDone={onSimDone} />
    case 'states':
      return <StatesSim onDone={onSimDone} />
    case 'atom':
      return <AtomSim spec={spec} onDone={onSimDone} />
    case 'mohs':
      return <MohsSim spec={spec} onDone={onSimDone} />
    case 'plates':
      return <PlatesSim spec={spec} onDone={onSimDone} />
    case 'balance':
      return <BalanceSim onDone={onSimDone} />
    case 'moon':
      return <MoonSim spec={spec} onDone={onSimDone} />
    case 'seasons':
      return <SeasonsSim spec={spec} onDone={onSimDone} />
  }
}
