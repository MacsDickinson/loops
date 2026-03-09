export const ProductLifecycleStages = [
  'idea',
  'pilot',
  'incubating',
  'graduating',
  'growth',
  'sunset',
] as const

export type ProductLifecycleStage = (typeof ProductLifecycleStages)[number]

export const FeatureLifecycleStages = [
  'pilot',
  'incubating',
  'graduating',
  'growth',
  'sunset',
] as const

export type FeatureLifecycleStage = (typeof FeatureLifecycleStages)[number]

const featureTransitions: Record<FeatureLifecycleStage, FeatureLifecycleStage | null> = {
  pilot: 'incubating',
  incubating: 'graduating',
  graduating: 'growth',
  growth: 'sunset',
  sunset: null,
}

export function getNextFeatureStage(
  current: FeatureLifecycleStage
): FeatureLifecycleStage | null {
  return featureTransitions[current]
}

export function canTransitionFeature(
  from: FeatureLifecycleStage,
  to: FeatureLifecycleStage
): boolean {
  return featureTransitions[from] === to
}
