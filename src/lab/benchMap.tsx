import type { ComponentType } from 'react'
import type { BenchId } from './experiments'
import { BrickPull, MarbleRamp, ShakeFlasks, WeatherMap, type BenchProps } from './benches1'
import { ChemReactions, DensityLab, MixturesLab, MoleculeBuilder } from './benches2'
import { AlumCrystals, PlatePuzzle, Sediments, WeatheringLab } from './benches3'
import { HomeBarometer, LampGlobe, PlanetOrbits, StarSky } from './benches4'
import { ArmModel, Dissection, MicroscopeLab, YeastLab } from './benches5'
import { FoodWebBuilder, GreenhouseLab, Quadrats, SolarBox } from './benches6'

export const BENCHES: Record<BenchId, ComponentType<BenchProps>> = {
  flasks: ShakeFlasks, weather: WeatherMap, marbles: MarbleRamp, bricks: BrickPull,
  density: DensityLab, chem: ChemReactions, molecules: MoleculeBuilder, mixtures: MixturesLab,
  alum: AlumCrystals, sediments: Sediments, plates: PlatePuzzle, weathering: WeatheringLab,
  barometer: HomeBarometer, lamp: LampGlobe, orbits: PlanetOrbits, stars: StarSky,
  yeast: YeastLab, microscope: MicroscopeLab, arm: ArmModel,
  earthworm: (p) => <Dissection id="earthworm" {...p} />,
  grasshopper: (p) => <Dissection id="grasshopper" {...p} />,
  fish: (p) => <Dissection id="fish" {...p} />,
  quadrats: Quadrats, foodweb: FoodWebBuilder, solar: SolarBox, greenhouse: GreenhouseLab,
}
