export const ANIMAL_ATLAS_TIERS = 9;
export const ANIMAL_ATLAS_TOP = ANIMAL_ATLAS_TIERS;
export const ANIMAL_ATLAS_BOTTOM = ANIMAL_ATLAS_TIERS + 1;
export const ANIMAL_ATLAS_HEADER_BYTES = 4;
export const FISH_ATLAS_SPECIES = ['tropical', 'clown', 'koi', 'puffer', 'angelfish'] as const;
export const ASYMMETRIC_ATLAS_FACTORIES = new Set([
  'getAntlerWardenPosePack', 'getThornUrsaPosePack', 'getTravelerPosePack',
]);

export function animalAtlasDirectionCount(tier: number, asymmetric?: boolean) {
  return tier >= ANIMAL_ATLAS_TOP ? 1 : asymmetric ? 16 : 9;
}

export function animalAtlasFolder(module: string, factory: string, variant: readonly unknown[]) {
  const name = factory.replace(/^get/, '').replace(/PosePack$/, '');
  const species = name.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
  if (factory === 'getBlackWidowPosePack' && module === './ArachnidsPack.ts') return 'black-widow/arachnids-pack';
  return variant.length ? `${species}-${variant.join('-')}` : species;
}
