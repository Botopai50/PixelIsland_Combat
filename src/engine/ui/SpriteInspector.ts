import { PILLBUG_IDLE, PILLBUG_WALK, PILLBUG_CURL, PILLBUG_W, PILLBUG_H, PILLBUG_PW, PILLBUG_PH, getPillBugPosePack, type PillBugPose } from '../enemies/PillBug';
import * as THREE from 'three';
import { ACTOR_PIXELS_PER_METER, actorScreenPixelSize, actorSpriteResolution } from '../character/ActorPixelGrid';
import { getAnimalDensityTexture, getAnimalTurnTexture } from '../enemies/AnimalSpriteCache';
import { previewAnimalTurn } from '../enemies/AnimalTurnPose';
import { HERO_STYLE, HumanoidRig } from '../character/HumanoidRig';
import { SkeletalBillboard, type HeroBodyPartKey } from '../character/SkeletalBillboard';
import {
  buildTravelerPosePack, TRAVELER_CENTER, TRAVELER_IDLE, TRAVELER_IDLE_FPS,
  TRAVELER_PX, TRAVELER_SIZE, TRAVELER_TALK, TRAVELER_TALK_FPS, type TravelerPose,
} from '../npc/TravelerSprites';
import {
  buildAntlerWardenPosePack, getAntlerWardenPosePack, WARDEN_CENTER, WARDEN_IDLE, WARDEN_PH, WARDEN_PW,
  WARDEN_SIZE, WARDEN_STOMP, WARDEN_STONES, WARDEN_SWEEP, WARDEN_WALK, type WardenPose,
} from '../enemies/AntlerWardenSprites';
import {
  buildThornUrsaPosePack, getThornUrsaPosePack, URSA_CENTER, URSA_CHARGE, URSA_IDLE, URSA_PH, URSA_PW,
  URSA_ROOTS, URSA_SIZE, URSA_SLAM, URSA_WALK, type UrsaPose,
} from '../enemies/ThornUrsaSprites';
import type { EightWayTier } from '../character/HeroBillboardSprites';
import {
  BOAR_H, BOAR_PH, BOAR_PPU, BOAR_PW, BOAR_W,
  getBoarPosePack, type Boar27Pack, type BoarPoseName,
} from '../enemies/Boar';
import {
  ANIMAL_PPU,
  CHICKEN_H, CHICKEN_PH, CHICKEN_PW, CHICKEN_W, getChickenPosePack, type ChickenPoseName,
  CREATURE_FRAGMENT_SHADER, CREATURE_PITCHES, CREATURE_VERTEX_SHADER, CREATURE_YAWS, getRealWorldScale,
  FISH_SPECIES_META, getFishPosePack, type FishPoseName, type FishSpecies,
  RABBIT_H, RABBIT_PH, RABBIT_PW, RABBIT_W, getRabbitPosePack, type RabbitPoseName,
  pick27View,
} from '../enemies/Animals';
import {
  BEAR_H, BEAR_PH, BEAR_PW, BEAR_W, getBearPosePack, type BearPoseName,
  DEER_H, DEER_PH, DEER_PW, DEER_W, getDeerPosePack, type DeerPoseName,
  FOX_H, FOX_PH, FOX_PW, FOX_W, getFoxPosePack, type FoxPoseName,
  FROG_H, FROG_PH, FROG_PW, FROG_W, getFrogPosePack, type FrogPoseName,
  TURTLE_H, TURTLE_PH, TURTLE_PW, TURTLE_W, getTurtlePosePack, type TurtlePoseName,
  WOLF_H, WOLF_PH, WOLF_PW, WOLF_W, getWolfPosePack, type WolfPoseName,
} from '../enemies/MoreAnimals';
import {
  BADGER_H, BADGER_PH, BADGER_PW, BADGER_W, getBadgerPosePack, type BadgerPoseName,
  OWL_H, OWL_PH, OWL_PW, OWL_W, getOwlPosePack, type OwlPoseName,
  SQUIRREL_H, SQUIRREL_PH, SQUIRREL_PW, SQUIRREL_W, getSquirrelPosePack, type SquirrelPoseName,
} from '../enemies/ForestAnimals';
import {
  DUCK_H, DUCK_PH, DUCK_PW, DUCK_W, getDuckPosePack, type DuckPoseName,
  GOAT_H, GOAT_PH, GOAT_PW, GOAT_W, getGoatPosePack, type GoatPoseName,
  SNAKE_H, SNAKE_PH, SNAKE_PW, SNAKE_W, getSnakePosePack, type SnakePoseName,
} from '../enemies/WildAnimals';
import {
  HEDGEHOG_H, HEDGEHOG_PH, HEDGEHOG_PW, HEDGEHOG_W, getHedgehogPosePack, type HedgehogPoseName,
  PIG_H, PIG_PH, PIG_PW, PIG_W, getPigPosePack, type PigPoseName,
  SHEEP_H, SHEEP_PH, SHEEP_PW, SHEEP_W, getSheepPosePack, type SheepPoseName,
} from '../enemies/MeadowAnimals';
import {
  CRAB_H, CRAB_PH, CRAB_PW, CRAB_W, getCrabPosePack, type CrabPoseName,
  EAGLE_H, EAGLE_PH, EAGLE_PW, EAGLE_W, getEaglePosePack, type EaglePoseName,
  PANTHER_H, PANTHER_PH, PANTHER_PW, PANTHER_W, getPantherPosePack, type PantherPoseName,
} from '../enemies/ExoticAnimals';
import { CROW_H, CROW_PH, CROW_PW, CROW_W, getCrowPosePack, type CrowPoseName } from '../enemies/Crow';
import { BEETLE_H, BEETLE_PH, BEETLE_PW, BEETLE_W, getBeetlePosePack, type BeetlePoseName } from '../enemies/Beetle';
import { BUTTERFLY_H, BUTTERFLY_PH, BUTTERFLY_PW, BUTTERFLY_W, getButterflyPosePack, type ButterflyPoseName } from '../enemies/Butterfly';
import { BEE_H, BEE_PH, BEE_PW, BEE_W, getBeePosePack, type BeePoseName } from '../enemies/Bee';
import { DRAGONFLY_H, DRAGONFLY_PH, DRAGONFLY_PW, DRAGONFLY_W, getDragonflyPosePack, type DragonflyPoseName } from '../enemies/Dragonfly';
import { RED_PANDA_H, RED_PANDA_PH, RED_PANDA_PW, RED_PANDA_W, getRedPandaPosePack, type RedPandaPoseName } from '../enemies/RedPanda';
import { GIANT_PANDA_H, GIANT_PANDA_PH, GIANT_PANDA_PW, GIANT_PANDA_W, getGiantPandaPosePack, type GiantPandaPoseName } from '../enemies/GiantPanda';
import { POLAR_BEAR_H, POLAR_BEAR_PH, POLAR_BEAR_PW, POLAR_BEAR_W, getPolarBearPosePack, type PolarBearPoseName } from '../enemies/PolarBear';
import { SPECTACLED_BEAR_H, SPECTACLED_BEAR_PH, SPECTACLED_BEAR_PW, SPECTACLED_BEAR_W, getSpectacledBearPosePack, type SpectacledBearPoseName } from '../enemies/SpectacledBear';
import { CHEETAH_H, CHEETAH_PH, CHEETAH_PW, CHEETAH_W, getCheetahPosePack, type CheetahPoseName } from '../enemies/Cheetah';
import { JAGUAR_H, JAGUAR_PH, JAGUAR_PW, JAGUAR_W, getJaguarPosePack, type JaguarPoseName } from '../enemies/Jaguar';
import { TASMANIAN_DEVIL_H, TASMANIAN_DEVIL_PH, TASMANIAN_DEVIL_PW, TASMANIAN_DEVIL_W, getTasmanianDevilPosePack, type TasmanianDevilPoseName } from '../enemies/TasmanianDevil';
import { WEASEL_H, WEASEL_PH, WEASEL_PW, WEASEL_W, getWeaselPosePack, type WeaselPoseName } from '../enemies/Weasel';
import { OTTER_H, OTTER_PH, OTTER_PW, OTTER_W, getOtterPosePack, type OtterPoseName } from '../enemies/Otter';
import { FLAMINGO_H, FLAMINGO_PH, FLAMINGO_PW, FLAMINGO_W, getFlamingoPosePack, type FlamingoPoseName } from '../enemies/Flamingo';
import { HIPPO_H, HIPPO_PH, HIPPO_PW, HIPPO_W, getHippoPosePack, type HippoPoseName } from '../enemies/Hippo';
import { ELEPHANT_H, ELEPHANT_PH, ELEPHANT_PW, ELEPHANT_W, getElephantPosePack, type ElephantPoseName } from '../enemies/Elephant';
import { LION_H, LION_PH, LION_PW, LION_W, getLionPosePack, type LionPoseName } from '../enemies/Lion';
import { TIGER_H, TIGER_PH, TIGER_PW, TIGER_W, getTigerPosePack, type TigerPoseName } from '../enemies/Tiger';
import { KING_CRAB_H, KING_CRAB_PH, KING_CRAB_PW, KING_CRAB_W, getKingCrabPosePack, type KingCrabPoseName } from '../enemies/KingCrab';
import { OCTOPUS_H, OCTOPUS_PH, OCTOPUS_PW, OCTOPUS_W, getOctopusPosePack, type OctopusPoseName } from '../enemies/Octopus';
import { SQUID_H, SQUID_PH, SQUID_PW, SQUID_W, getSquidPosePack, type SquidPoseName } from '../enemies/Squid';
import { LOBSTER_H, LOBSTER_PH, LOBSTER_PW, LOBSTER_W, getLobsterPosePack, type LobsterPoseName } from '../enemies/Lobster';
import { DOLPHIN_H, DOLPHIN_PH, DOLPHIN_PW, DOLPHIN_W, getDolphinPosePack, type DolphinPoseName } from '../enemies/Dolphin';
import { PINK_DOLPHIN_H, PINK_DOLPHIN_PH, PINK_DOLPHIN_PW, PINK_DOLPHIN_W, getPinkDolphinPosePack, type PinkDolphinPoseName } from '../enemies/PinkDolphin';
import { HORSE_H, HORSE_PH, HORSE_PW, HORSE_W, getHorsePosePack, type HorsePoseName } from '../enemies/Horse';
import { DONKEY_H, DONKEY_PH, DONKEY_PW, DONKEY_W, getDonkeyPosePack, type DonkeyPoseName } from '../enemies/Donkey';
import { BABOON_H, BABOON_PH, BABOON_PW, BABOON_W, getBaboonPosePack, type BaboonPoseName } from '../enemies/Baboon';
import { GORILLA_H, GORILLA_PH, GORILLA_PW, GORILLA_W, getGorillaPosePack, type GorillaPoseName } from '../enemies/Gorilla';
import { TAMARIN_H, TAMARIN_PH, TAMARIN_PW, TAMARIN_W, getGoldenLionTamarinPosePack, type GoldenLionTamarinPoseName } from '../enemies/GoldenLionTamarin';
import { CHIMP_H, CHIMP_PH, CHIMP_PW, CHIMP_W, getChimpanzeePosePack, type ChimpanzeePoseName } from '../enemies/Chimpanzee';
import { ORANGUTAN_H, ORANGUTAN_PH, ORANGUTAN_PW, ORANGUTAN_W, getOrangutanPosePack, type OrangutanPoseName } from '../enemies/Orangutan';
import { VULTURE_H, VULTURE_PH, VULTURE_PW, VULTURE_W, getVulturePosePack, type VulturePoseName } from '../enemies/Vulture';
import { PLANT_CENTER_Y, PLANT_H, PLANT_PH, PLANT_PW, PLANT_W, getPlantPosePack, type PlantPose } from '../enemies/PlantSprites';
import { getBrambleMawPosePack, MAW_BITE, MAW_CENTER, MAW_IDLE, MAW_PH, MAW_PW, MAW_ROOTS, MAW_SIZE, MAW_SWEEP, MAW_WALK, type MawPose } from '../enemies/BrambleMawSprites';
import { ANTEATER_H, ANTEATER_PH, ANTEATER_PW, ANTEATER_W, getAnteaterPosePack, type AnteaterPoseName } from '../enemies/Anteater';
import { MARY_TURTLE_H, MARY_TURTLE_PH, MARY_TURTLE_PW, MARY_TURTLE_W, getMaryRiverTurtlePosePack, type MaryRiverTurtlePoseName } from '../enemies/MaryRiverTurtle';
import { HYENA_H, HYENA_PH, HYENA_PW, HYENA_W, getHyenaPosePack, type HyenaPoseName } from '../enemies/Hyena';
import { BUFFALO_H, BUFFALO_PH, BUFFALO_PW, BUFFALO_W, getBuffaloPosePack, type BuffaloPoseName } from '../enemies/Buffalo';
import { BISON_H, BISON_PH, BISON_PW, BISON_W, getBisonPosePack, type BisonPoseName } from '../enemies/Bison';
import { MOOSE_H, MOOSE_PH, MOOSE_PW, MOOSE_W, getMoosePosePack, type MoosePoseName } from '../enemies/Moose';
import { TOUCAN_H, TOUCAN_PH, TOUCAN_PW, TOUCAN_W, getToucanPosePack, type ToucanPoseName } from '../enemies/Toucan';
import { PIGEON_H, PIGEON_PH, PIGEON_PW, PIGEON_W, getPigeonPosePack, type PigeonPoseName } from '../enemies/Pigeon';
import { PARROT_H, PARROT_PH, PARROT_PW, PARROT_W, getParrotPosePack, type ParrotPoseName } from '../enemies/Parrot';
import { PELICAN_H, PELICAN_PH, PELICAN_PW, PELICAN_W, getPelicanPosePack, type PelicanPoseName } from '../enemies/Pelican';
import { PENGUIN_H, PENGUIN_PH, PENGUIN_PW, PENGUIN_W, getPenguinPosePack, type PenguinPoseName } from '../enemies/Penguin';
import { OSTRICH_H, OSTRICH_PH, OSTRICH_PW, OSTRICH_W, getOstrichPosePack, type OstrichPoseName } from '../enemies/Ostrich';
import { RHEA_H, RHEA_PH, RHEA_PW, RHEA_W, getRheaPosePack, type RheaPoseName } from '../enemies/Rhea';
import { EMU_H, EMU_PH, EMU_PW, EMU_W, getEmuPosePack, type EmuPoseName } from '../enemies/Emu';
import { ALLIGATOR_H, ALLIGATOR_PH, ALLIGATOR_PW, ALLIGATOR_W, getAlligatorPosePack, type AlligatorPoseName } from '../enemies/Alligator';
import { CROCODILE_H, CROCODILE_PH, CROCODILE_PW, CROCODILE_W, getCrocodilePosePack, type CrocodilePoseName } from '../enemies/Crocodile';
import { GHARIAL_H, GHARIAL_PH, GHARIAL_PW, GHARIAL_W, getGharialPosePack, type GharialPoseName } from '../enemies/Gharial';
import { KOMODO_H, KOMODO_PH, KOMODO_PW, KOMODO_W, getKomodoDragonPosePack, type KomodoDragonPoseName } from '../enemies/KomodoDragon';
import { AXOLOTL_H, AXOLOTL_PH, AXOLOTL_PW, AXOLOTL_W, getAxolotlPosePack, type AxolotlPoseName } from '../enemies/Axolotl';
import { GREEN_LIZARD_H, GREEN_LIZARD_PH, GREEN_LIZARD_PW, GREEN_LIZARD_W, getGreenLizardPosePack, type GreenLizardPoseName } from '../enemies/GreenLizard';
import { CHAMELEON_H, CHAMELEON_PH, CHAMELEON_PW, CHAMELEON_W, getChameleonPosePack, type ChameleonPoseName } from '../enemies/Chameleon';
import { SWORDFISH_H, SWORDFISH_PH, SWORDFISH_PW, SWORDFISH_W, getSwordfishPosePack, type SwordfishPoseName } from '../enemies/Swordfish';
import { STINGRAY_H, STINGRAY_PH, STINGRAY_PW, STINGRAY_W, getStingrayPosePack, type StingrayPoseName } from '../enemies/Stingray';
import { NARWHAL_H, NARWHAL_PH, NARWHAL_PW, NARWHAL_W, getNarwhalPosePack, type NarwhalPoseName } from '../enemies/Narwhal';
import { SCORPION_H, SCORPION_PH, SCORPION_PW, SCORPION_W, getScorpionPosePack, type ScorpionPoseName } from '../enemies/Scorpion';
import {
  BLACK_WIDOW_H, BLACK_WIDOW_PH, BLACK_WIDOW_PW, BLACK_WIDOW_W, getBlackWidowPosePack, type BlackWidowPoseName,
  GOLIATH_SPIDER_H, GOLIATH_SPIDER_PH, GOLIATH_SPIDER_PW, GOLIATH_SPIDER_W, getGoliathSpiderPosePack, type GoliathSpiderPoseName,
  TARANTULA_H, TARANTULA_PH, TARANTULA_PW, TARANTULA_W, getTarantulaPosePack, type TarantulaPoseName,
  TRAPDOOR_SPIDER_H, TRAPDOOR_SPIDER_PH, TRAPDOOR_SPIDER_PW, TRAPDOOR_SPIDER_W, getTrapdoorSpiderPosePack, type TrapdoorSpiderPoseName,
  WANDERING_SPIDER_H, WANDERING_SPIDER_PH, WANDERING_SPIDER_PW, WANDERING_SPIDER_W, getWanderingSpiderPosePack, type WanderingSpiderPoseName,
} from '../enemies/ArachnidsPack';
import {
  DUNG_BEETLE_H, DUNG_BEETLE_PH, DUNG_BEETLE_PW, DUNG_BEETLE_W, getDungBeetlePosePack, type DungBeetlePoseName,
  HERCULES_BEETLE_H, HERCULES_BEETLE_PH, HERCULES_BEETLE_PW, HERCULES_BEETLE_W, getHerculesBeetlePosePack, type HerculesBeetlePoseName,
  PRAYING_MANTIS_H, PRAYING_MANTIS_PH, PRAYING_MANTIS_PW, PRAYING_MANTIS_W, getPrayingMantisPosePack, type PrayingMantisPoseName,
  TARANTULA_HAWK_H, TARANTULA_HAWK_PH, TARANTULA_HAWK_PW, TARANTULA_HAWK_W, getTarantulaHawkPosePack, type TarantulaHawkPoseName,
  WASP_H, WASP_PH, WASP_PW, WASP_W, getWaspPosePack, type WaspPoseName,
} from '../enemies/InsectsPackA';
import {
  ANT_H, ANT_PH, ANT_PW, ANT_W, getAntPosePack, type AntPoseName,
  CATERPILLAR_H, CATERPILLAR_PH, CATERPILLAR_PW, CATERPILLAR_W, getCaterpillarPosePack, type CaterpillarPoseName,
  EARTHWORM_H, EARTHWORM_PH, EARTHWORM_PW, EARTHWORM_W, getEarthwormPosePack, type EarthwormPoseName,
  FIREFLY_H, FIREFLY_PH, FIREFLY_PW, FIREFLY_W, getFireflyPosePack, type FireflyPoseName,
  FLY_H, FLY_PH, FLY_PW, FLY_W, getFlyPosePack, type FlyPoseName,
  GRASSHOPPER_H, GRASSHOPPER_PH, GRASSHOPPER_PW, GRASSHOPPER_W, getGrasshopperPosePack, type GrasshopperPoseName,
  LADYBUG_H, LADYBUG_PH, LADYBUG_PW, LADYBUG_W, getLadybugPosePack, type LadybugPoseName,
  MOTH_H, MOTH_PH, MOTH_PW, MOTH_W, getMothPosePack, type MothPoseName,
} from '../enemies/InsectsPackB';
import {
  ARMADILLO_H, ARMADILLO_PH, ARMADILLO_PW, ARMADILLO_W, getArmadilloPosePack, type ArmadilloPoseName,
  GIRAFFE_H, GIRAFFE_PH, GIRAFFE_PW, GIRAFFE_W, getGiraffePosePack, type GiraffePoseName,
  KIWI_H, KIWI_PH, KIWI_PW, KIWI_W, getKiwiPosePack, type KiwiPoseName,
  RACCOON_H, RACCOON_PH, RACCOON_PW, RACCOON_W, getRaccoonPosePack, type RaccoonPoseName,
  THREE_BANDED_ARMADILLO_H, THREE_BANDED_ARMADILLO_PH, THREE_BANDED_ARMADILLO_PW, THREE_BANDED_ARMADILLO_W, getThreeBandedArmadilloPosePack, type ThreeBandedArmadilloPoseName,
  ZEBRA_H, ZEBRA_PH, ZEBRA_PW, ZEBRA_W, getZebraPosePack, type ZebraPoseName,
} from '../enemies/SavannaPack';
import {
  DUMBO_OCTOPUS_H, DUMBO_OCTOPUS_PH, DUMBO_OCTOPUS_PW, DUMBO_OCTOPUS_W, getDumboOctopusPosePack, type DumboOctopusPoseName,
  JELLYFISH_H, JELLYFISH_PH, JELLYFISH_PW, JELLYFISH_W, getJellyfishPosePack, type JellyfishPoseName,
  MANTIS_SHRIMP_H, MANTIS_SHRIMP_PH, MANTIS_SHRIMP_PW, MANTIS_SHRIMP_W, getMantisShrimpPosePack, type MantisShrimpPoseName,
  PISTOL_SHRIMP_H, PISTOL_SHRIMP_PH, PISTOL_SHRIMP_PW, PISTOL_SHRIMP_W, getPistolShrimpPosePack, type PistolShrimpPoseName,
  VAMPIRE_SQUID_H, VAMPIRE_SQUID_PH, VAMPIRE_SQUID_PW, VAMPIRE_SQUID_W, getVampireSquidPosePack, type VampireSquidPoseName,
} from '../enemies/DeepSeaPack';

interface SpriteEntry {
  id: string;
  codeName: string;
  part: HeroBodyPartKey | 'creature';
  partLabel: string;
  jointLabel: string;
  angleLabel: string;
  pitchLabel: string;
  yawLabel: string;
  condition: string;
  mirrorNote?: string;
  camYawDeg: number;
  camPitchDeg: number;
  targetY: number;
  camDist: number;
  w: number;
  h: number;
  dataUrl: string;
}

type EntityKey =
  | 'hero' | 'traveler' | 'boar' | 'pill_bug' | 'carnivorous_plant' | 'bramble_maw' | 'thorn_ursa' | 'antler_warden'
  | 'fish' | 'clown' | 'koi' | 'puffer' | 'angelfish'
  | 'rabbit' | 'chicken' | 'wolf' | 'deer' | 'bear' | 'fox' | 'frog' | 'turtle'
  | 'owl' | 'squirrel' | 'badger' | 'duck' | 'snake' | 'goat'
  | 'sheep' | 'pig' | 'hedgehog' | 'crab' | 'eagle' | 'panther'
  | 'crow' | 'beetle' | 'butterfly' | 'bee' | 'dragonfly' | 'red_panda' | 'giant_panda' | 'polar_bear' | 'spectacled_bear' | 'cheetah' | 'jaguar' | 'tasmanian_devil' | 'weasel' | 'otter' | 'flamingo' | 'hippo' | 'elephant' | 'lion' | 'tiger' | 'king_crab' | 'octopus' | 'squid' | 'lobster' | 'dolphin' | 'pink_dolphin' | 'horse' | 'donkey' | 'baboon' | 'gorilla' | 'golden_lion_tamarin' | 'chimpanzee' | 'orangutan' | 'vulture' | 'anteater' | 'mary_river_turtle' | 'hyena' | 'buffalo' | 'bison' | 'moose' | 'toucan' | 'pigeon' | 'parrot' | 'pelican' | 'penguin' | 'ostrich' | 'rhea' | 'emu' | 'alligator' | 'crocodile' | 'gharial' | 'komodo_dragon' | 'axolotl' | 'green_lizard' | 'chameleon' | 'swordfish' | 'stingray' | 'narwhal' | 'scorpion'
  | 'black_widow' | 'tarantula' | 'wandering_spider' | 'trapdoor_spider' | 'goliath_spider'
  | 'dung_beetle' | 'hercules_beetle' | 'praying_mantis' | 'wasp' | 'tarantula_hawk'
  | 'earthworm' | 'ant' | 'caterpillar' | 'moth' | 'firefly' | 'ladybug' | 'grasshopper' | 'fly'
  | 'raccoon' | 'giraffe' | 'zebra' | 'armadillo' | 'three_banded_armadillo' | 'kiwi'
  | 'vampire_squid' | 'jellyfish' | 'dumbo_octopus' | 'mantis_shrimp' | 'pistol_shrimp';
type HeroFilterKey = 'all' | 'head' | 'torso' | 'pelvis' | 'shin' | 'limbs';
type HeroAnimKey = 'idle' | 'walk' | 'run' | 'jump';

interface CreatureAnimDef<P extends string = string> {
  id: string;
  label: string;
  frames: P[];
  fps: number;
  isCycle: boolean;
  bobAmp?: number;
  hopAmp?: number;
}

interface CreatureConfig {
  key: Exclude<EntityKey, 'hero'>;
  label: string;
  pw: number;
  ph: number;
  ppu: number;
  worldW: number;
  worldH: number;
  centerY: number;
  camDist: number;
  getPack: (pose: string) => Boar27Pack;
  getSheetPack?: (pose: string) => Boar27Pack;
  anims: CreatureAnimDef[];
  poses: { key: string; label: string }[];
}

function defineCreature<P extends string>(cfg: {
  key: Exclude<EntityKey, 'hero'>;
  label: string;
  pw: number;
  ph: number;
  ppu: number;
  worldW: number;
  worldH: number;
  centerY: number;
  camDist: number;
  getPack: (pose: P) => Boar27Pack;
  getSheetPack?: (pose: P) => Boar27Pack;
  anims: CreatureAnimDef<P>[];
  poses: readonly P[];
}): CreatureConfig {
  return {
    ...cfg,
    getPack: (p) => cfg.getPack(p as P),
    getSheetPack: cfg.getSheetPack && ((p) => cfg.getSheetPack!(p as P)),
    poses: cfg.poses.map((key) => ({ key, label: key })),
  };
}

const ENTITY_TABS: { key: EntityKey; label: string }[] = [
  { key: 'hero', label: '🧑 Herói' },
  { key: 'traveler', label: 'Bento, o viajante' },
  { key: 'pill_bug', label: '🪵 Tatuzinho-de-jardim' },
  { key: 'carnivorous_plant', label: '🌱 Planta carnívora' },
  { key: 'bramble_maw', label: '🌺 Flor-de-Espinhos' },
  { key: 'thorn_ursa', label: '🐻 Urso de Espinhos' },
  { key: 'antler_warden', label: 'Guardião Galhudo' },
  { key: 'vulture', label: '🦅 Urubu' },
  { key: 'boar', label: '🐗 Javali' },
  { key: 'fish', label: '🐟 Peixe' },
  { key: 'clown', label: '🐠 Palhaço' },
  { key: 'koi', label: '🎏 Carpa Koi' },
  { key: 'puffer', label: '🐡 Baiacu' },
  { key: 'angelfish', label: '🐠 Peixe-Anjo' },
  { key: 'rabbit', label: '🐇 Coelho' },
  { key: 'chicken', label: '🐔 Galinha' },
  { key: 'wolf', label: '🐺 Lobo' },
  { key: 'deer', label: '🦌 Cervo' },
  { key: 'bear', label: '🐻 Urso' },
  { key: 'fox', label: '🦊 Raposa' },
  { key: 'frog', label: '🐸 Sapo' },
  { key: 'turtle', label: '🐢 Tartaruga' },
  { key: 'owl', label: '🦉 Coruja' },
  { key: 'squirrel', label: '🐿️ Esquilo' },
  { key: 'badger', label: '🦡 Texugo' },
  { key: 'duck', label: '🦆 Pato' },
  { key: 'snake', label: '🐍 Cobra' },
  { key: 'goat', label: '🐐 Cabra' },
  { key: 'sheep', label: '🐑 Ovelha' },
  { key: 'pig', label: '🐖 Porco' },
  { key: 'hedgehog', label: '🦔 Ouriço' },
  { key: 'crab', label: '🦀 Caranguejo' },
  { key: 'eagle', label: '🦅 Águia' },
  { key: 'panther', label: '🐆 Pantera' },
  { key: 'crow', label: '🐦‍⬛ Corvo' },
  { key: 'beetle', label: '🪲 Besouro' },
  { key: 'butterfly', label: '🦋 Borboleta' },
  { key: 'bee', label: '🐝 Abelha' },
  { key: 'dragonfly', label: '🪰 Libélula' },
  { key: 'red_panda', label: '🐾 Panda Vermelho' },
  { key: 'giant_panda', label: '🐼 Panda' },
  { key: 'polar_bear', label: '🐻‍❄️ Urso Polar' },
  { key: 'spectacled_bear', label: '🐻 Urso de Óculos' },
  { key: 'cheetah', label: '🐆 Guepardo' },
  { key: 'jaguar', label: '🐆 Onça-Pintada' },
  { key: 'tasmanian_devil', label: '😈 Diabo-da-Tasmânia' },
  { key: 'weasel', label: '🐾 Fuinha' },
  { key: 'otter', label: '🦦 Lontra' },
  { key: 'flamingo', label: '🦩 Flamingo' },
  { key: 'hippo', label: '🦛 Hipopótamo' },
  { key: 'elephant', label: '🐘 Elefante' },
  { key: 'lion', label: '🦁 Leão' },
  { key: 'tiger', label: '🐯 Tigre' },
  { key: 'king_crab', label: '🦀 Caranguejo-Rei' },
  { key: 'octopus', label: '🐙 Polvo' },
  { key: 'squid', label: '🦑 Lula' },
  { key: 'lobster', label: '🦞 Lagosta' },
  { key: 'dolphin', label: '🐬 Golfinho' },
  { key: 'pink_dolphin', label: '🐬 Boto-Cor-de-Rosa' },
  { key: 'horse', label: '🐴 Cavalo' },
  { key: 'donkey', label: '🫏 Burro' },
  { key: 'baboon', label: '🐒 Babuíno' },
  { key: 'gorilla', label: '🦍 Gorila' },
  { key: 'golden_lion_tamarin', label: '🐒 Mico-Leão-Dourado' },
  { key: 'chimpanzee', label: '🐒 Chimpanzé' },
  { key: 'orangutan', label: '🦧 Orangotango' },
  { key: 'anteater', label: '🐾 Tamanduá' },
  { key: 'mary_river_turtle', label: '🐢 Tartaruga-do-Rio-Mary' },
  { key: 'hyena', label: '🐾 Hiena' },
  { key: 'buffalo', label: '🐃 Búfalo' },
  { key: 'bison', label: '🦬 Bisão' },
  { key: 'moose', label: '🫎 Alce' },
  { key: 'toucan', label: '🦜 Tucano' },
  { key: 'pigeon', label: '🕊️ Pombo' },
  { key: 'parrot', label: '🦜 Papagaio' },
  { key: 'pelican', label: '🦤 Pelicano' },
  { key: 'penguin', label: '🐧 Pinguim' },
  { key: 'ostrich', label: '🦤 Avestruz' },
  { key: 'rhea', label: '🦤 Ema' },
  { key: 'emu', label: '🦤 Emu' },
  { key: 'alligator', label: '🐊 Jacaré' },
  { key: 'crocodile', label: '🐊 Crocodilo' },
  { key: 'gharial', label: '🐊 Gavial' },
  { key: 'komodo_dragon', label: '🦎 Dragão-de-Komodo' },
  { key: 'axolotl', label: '🦎 Axolote' },
  { key: 'green_lizard', label: '🦎 Calango Verde' },
  { key: 'chameleon', label: '🦎 Camaleão' },
  { key: 'swordfish', label: '🐟 Peixe-Espada' },
  { key: 'stingray', label: '🐟 Arraia' },
  { key: 'narwhal', label: '🐳 Narval' },
  { key: 'scorpion', label: '🦂 Escorpião' },
  { key: 'black_widow', label: '🕷️ Viúva-Negra' },
  { key: 'tarantula', label: '🕷️ Tarântula' },
  { key: 'wandering_spider', label: '🕷️ Armadeira' },
  { key: 'trapdoor_spider', label: '🕷️ Aranha-Alçapão' },
  { key: 'goliath_spider', label: '🕷️ Aranha-Golias' },
  { key: 'dung_beetle', label: '🪲 Rola-Bosta' },
  { key: 'hercules_beetle', label: '🪲 Besouro-Hércules' },
  { key: 'praying_mantis', label: '🦗 Louva-Deus' },
  { key: 'wasp', label: '🐝 Vespa' },
  { key: 'tarantula_hawk', label: '🐝 Vespa-do-Cão' },
  { key: 'earthworm', label: '🪱 Minhoca' },
  { key: 'ant', label: '🐜 Formiga' },
  { key: 'caterpillar', label: '🐛 Lagarta' },
  { key: 'moth', label: '🦋 Mariposa' },
  { key: 'firefly', label: '✨ Vagalume' },
  { key: 'ladybug', label: '🐞 Joaninha' },
  { key: 'grasshopper', label: '🦗 Gafanhoto' },
  { key: 'fly', label: '🪰 Mosca' },
  { key: 'raccoon', label: '🦝 Guaxinim' },
  { key: 'giraffe', label: '🦒 Girafa' },
  { key: 'zebra', label: '🦓 Zebra' },
  { key: 'armadillo', label: '🐾 Tatu' },
  { key: 'three_banded_armadillo', label: '🐾 Tatu-Bolinha' },
  { key: 'kiwi', label: '🥝 Kiwi' },
  { key: 'vampire_squid', label: '🦑 Lula-Vampira' },
  { key: 'jellyfish', label: '🪼 Água-Viva' },
  { key: 'dumbo_octopus', label: '🐙 Polvo-Elefante' },
  { key: 'mantis_shrimp', label: '🦐 Camarão-Boxeador' },
  { key: 'pistol_shrimp', label: '🦞 Lagosta-Pistola' },
];

const HERO_FILTERS: { key: HeroFilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'head', label: 'Cabeça' },
  { key: 'torso', label: 'Torso' },
  { key: 'pelvis', label: 'Pélvis' },
  { key: 'shin', label: 'Canela+Bota' },
  { key: 'limbs', label: 'Membros' },
];

const HERO_ANIMS: { key: HeroAnimKey; label: string }[] = [
  { key: 'idle', label: 'Parado' },
  { key: 'walk', label: '▶ Andando' },
  { key: 'run', label: '▶ Correndo' },
  { key: 'jump', label: '▶ Pulando' },
];

function makeFishCreature(key: 'fish' | 'clown' | 'koi' | 'puffer' | 'angelfish', species: FishSpecies): CreatureConfig {
  const m = FISH_SPECIES_META[species];
  return defineCreature<FishPoseName>({
    key,
    label: m.label,
    pw: m.pw, ph: m.ph, ppu: ANIMAL_PPU, worldW: m.w, worldH: m.h,
    centerY: 0.34, camDist: species === 'koi' ? 1.7 : species === 'angelfish' ? 1.65 : 1.5,
    getPack: (p) => getFishPosePack(p, species),
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 7.2, isCycle: true, bobAmp: 0.03 },
      { id: 'c_dart', label: species === 'puffer' ? '▶ Inflado!' : '▶ Disparo', frames: ['dart0', 'dart1', 'dart2', 'dart3'], fps: 9.6, isCycle: true, bobAmp: 0.04 },
      { id: 'c_flop', label: '▶ Debate', frames: ['flop0', 'flop1', 'flop2', 'flop3'], fps: 9.0, isCycle: true, hopAmp: 0.14 },
    ],
    poses: [
      'swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5',
      'dart0', 'dart1', 'dart2', 'dart3',
      'flop0', 'flop1', 'flop2', 'flop3',
    ],
  });
}

const CREATURES: Record<Exclude<EntityKey, 'hero'>, CreatureConfig> = {
  antler_warden: defineCreature<WardenPose>({
    key: 'antler_warden', label: 'Guardião Galhudo',
    pw: WARDEN_PW, ph: WARDEN_PH, ppu: ANIMAL_PPU, worldW: WARDEN_SIZE, worldH: WARDEN_SIZE,
    centerY: WARDEN_CENTER, camDist: 12.4, getPack: getAntlerWardenPosePack, getSheetPack: buildAntlerWardenPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Parado', frames: [...WARDEN_IDLE], fps: 2, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: [...WARDEN_WALK], fps: 6, isCycle: true },
      { id: 'c_sweep', label: '▶ Braçada', frames: [...WARDEN_SWEEP], fps: 3, isCycle: true },
      { id: 'c_stomp', label: '▶ Pisão', frames: [...WARDEN_STOMP], fps: 3, isCycle: true },
      { id: 'c_stones', label: '▶ Rochas', frames: [...WARDEN_STONES], fps: 2.6, isCycle: true },
    ],
    poses: [...WARDEN_IDLE, ...WARDEN_WALK, ...WARDEN_SWEEP, ...WARDEN_STOMP, ...WARDEN_STONES],
  }),
  thorn_ursa: defineCreature<UrsaPose>({
    key: 'thorn_ursa', label: 'Urso de Espinhos',
    pw: URSA_PW, ph: URSA_PH, ppu: ANIMAL_PPU, worldW: URSA_SIZE, worldH: URSA_SIZE,
    centerY: URSA_CENTER, camDist: 6.7, getPack: getThornUrsaPosePack, getSheetPack: buildThornUrsaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Parado', frames: [...URSA_IDLE], fps: 2.5, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: [...URSA_WALK], fps: 8, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: [...URSA_CHARGE], fps: 3.5, isCycle: true },
      { id: 'c_slam', label: '▶ Pancada', frames: [...URSA_SLAM], fps: 3.6, isCycle: true },
      { id: 'c_roots', label: '▶ Raízes', frames: [...URSA_ROOTS], fps: 3.2, isCycle: true },
    ],
    poses: [...URSA_IDLE, ...URSA_WALK, ...URSA_CHARGE, ...URSA_SLAM, ...URSA_ROOTS],
  }),
  bramble_maw: defineCreature<MawPose>({
    key: 'bramble_maw', label: 'Flor-de-Espinhos',
    pw: MAW_PW, ph: MAW_PH, ppu: ANIMAL_PPU, worldW: MAW_SIZE, worldH: MAW_SIZE,
    centerY: MAW_CENTER, camDist: 7.5, getPack: getBrambleMawPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Parada', frames: [...MAW_IDLE], fps: 3.5, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: [...MAW_WALK], fps: 10, isCycle: true },
      { id: 'c_bite', label: '▶ Mordida', frames: [...MAW_BITE], fps: 4.25, isCycle: true },
      { id: 'c_sweep', label: '▶ Varredura', frames: [...MAW_SWEEP], fps: 3.2, isCycle: true },
      { id: 'c_roots', label: '▶ Raízes', frames: [...MAW_ROOTS], fps: 2.7, isCycle: true },
    ],
    poses: [...MAW_IDLE, ...MAW_WALK, ...MAW_BITE, ...MAW_SWEEP, ...MAW_ROOTS],
  }),
  carnivorous_plant: defineCreature<PlantPose>({
    key: 'carnivorous_plant', label: 'Planta carnívora',
    pw: PLANT_PW, ph: PLANT_PH, ppu: ANIMAL_PPU, worldW: PLANT_W, worldH: PLANT_H,
    centerY: PLANT_CENTER_Y, camDist: 5.6,
    getPack: getPlantPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Parada', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 3, isCycle: true },
      { id: 'c_bite', label: '▶ Mordida', frames: ['bite0', 'bite1', 'bite2', 'bite3'], fps: 5, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'bite0', 'bite1', 'bite2', 'bite3'],
  }),
  boar: defineCreature<BoarPoseName>({
    key: 'boar',
    label: 'Javali',
    pw: BOAR_PW, ph: BOAR_PH, ppu: BOAR_PPU, worldW: BOAR_W, worldH: BOAR_H,
    centerY: 0.48, camDist: 2.35,
    getPack: getBoarPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle2', 'idle3'], fps: 3.2, isCycle: true, bobAmp: 0.008 },
      { id: 'c_walk', label: '▶ Trote', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 9.0, isCycle: true, bobAmp: 0.025 },
      { id: 'c_windup', label: '▶ Preparando', frames: ['windup0', 'windup1', 'windup2', 'windup3'], fps: 8.5, isCycle: true },
      { id: 'c_dash', label: '▶ Investida', frames: ['dash0', 'dash1', 'dash2', 'dash3', 'dash4', 'dash5'], fps: 14.0, isCycle: true, bobAmp: 0.04 },
      { id: 'c_jump', label: '▶ Pulo', frames: ['jump0', 'jump1'], fps: 3.0, isCycle: true, hopAmp: 0.22 },
      { id: 'c_hurt', label: 'Dano', frames: ['hurt'], fps: 1, isCycle: false },
    ],
    poses: [
      'idle0', 'idle1', 'idle2', 'idle3',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'windup0', 'windup1', 'windup2', 'windup3',
      'dash0', 'dash1', 'dash2', 'dash3', 'dash4', 'dash5',
      'jump0', 'jump1', 'hurt',
    ],
  }),
  fish: makeFishCreature('fish', 'tropical'),
  clown: makeFishCreature('clown', 'clown'),
  koi: makeFishCreature('koi', 'koi'),
  puffer: makeFishCreature('puffer', 'puffer'),
  angelfish: makeFishCreature('angelfish', 'angelfish'),
  rabbit: defineCreature<RabbitPoseName>({
    key: 'rabbit',
    label: 'Coelho',
    pw: RABBIT_PW, ph: RABBIT_PH, ppu: ANIMAL_PPU, worldW: RABBIT_W, worldH: RABBIT_H,
    centerY: 0.28, camDist: 1.45,
    getPack: getRabbitPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle2', 'idle3'], fps: 2.4, isCycle: true, bobAmp: 0.006 },
      { id: 'c_hop', label: '▶ Pulo', frames: ['hop0', 'hop1', 'hop2', 'hop3', 'hop4', 'hop5'], fps: 9.0, isCycle: true, hopAmp: 0.24 },
      { id: 'c_hurt', label: 'Dano', frames: ['hurt'], fps: 1, isCycle: false },
    ],
    poses: [
      'idle0', 'idle1', 'idle2', 'idle3',
      'hop0', 'hop1', 'hop2', 'hop3', 'hop4', 'hop5',
      'hurt',
    ],
  }),
  chicken: defineCreature<ChickenPoseName>({
    key: 'chicken',
    label: 'Galinha',
    pw: CHICKEN_PW, ph: CHICKEN_PH, ppu: ANIMAL_PPU, worldW: CHICKEN_W, worldH: CHICKEN_H,
    centerY: 0.28, camDist: 1.45,
    getPack: getChickenPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle2'], fps: 2.2, isCycle: true, bobAmp: 0.005 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck3'], fps: 5.0, isCycle: true, bobAmp: 0.008 },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.022 },
      { id: 'c_flap', label: '▶ Voando', frames: ['flap0', 'flap1', 'flap2', 'flap3'], fps: 11.0, isCycle: true, hopAmp: 0.12 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'peck0', 'peck1', 'peck2', 'peck3',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'flap0', 'flap1', 'flap2', 'flap3',
    ],
  }),
  wolf: defineCreature<WolfPoseName>({
    key: 'wolf', label: 'Lobo',
    pw: WOLF_PW, ph: WOLF_PH, ppu: ANIMAL_PPU, worldW: WOLF_W, worldH: WOLF_H,
    centerY: 0.63, camDist: 3.05,
    getPack: getWolfPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true, bobAmp: 0.006 },
      { id: 'c_howl', label: '▶ Uivo', frames: ['howl0', 'howl1', 'howl2', 'howl3'], fps: 3.0, isCycle: true },
      { id: 'c_run', label: '▶ Galope', frames: ['run0', 'run1', 'run2', 'run3', 'run4', 'run5'], fps: 10.5, isCycle: true, bobAmp: 0.035 },
      { id: 'c_lunge', label: '▶ Bote', frames: ['lunge0', 'lunge1', 'lunge2'], fps: 5.5, isCycle: true, hopAmp: 0.16 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'howl0', 'howl1', 'howl2', 'howl3',
      'run0', 'run1', 'run2', 'run3', 'run4', 'run5',
      'lunge0', 'lunge1', 'lunge2',
    ],
  }),
  deer: defineCreature<DeerPoseName>({
    key: 'deer', label: 'Cervo',
    pw: DEER_PW, ph: DEER_PH, ppu: ANIMAL_PPU, worldW: DEER_W, worldH: DEER_H,
    centerY: 0.90, camDist: 3.65,
    getPack: getDeerPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true, bobAmp: 0.005 },
      { id: 'c_graze', label: '▶ Pastando', frames: ['graze0', 'graze1', 'graze2', 'graze3'], fps: 2.6, isCycle: true },
      { id: 'c_trot', label: '▶ Trote', frames: ['trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5'], fps: 8.5, isCycle: true, bobAmp: 0.035 },
      { id: 'c_leap', label: '▶ Salto', frames: ['leap0', 'leap1', 'leap2', 'leap3'], fps: 6.0, isCycle: true, hopAmp: 0.24 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'graze0', 'graze1', 'graze2', 'graze3',
      'trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5',
      'leap0', 'leap1', 'leap2', 'leap3',
    ],
  }),
  bear: defineCreature<BearPoseName>({
    key: 'bear', label: 'Urso Pardo',
    pw: BEAR_PW, ph: BEAR_PH, ppu: ANIMAL_PPU, worldW: BEAR_W, worldH: BEAR_H,
    centerY: 1.24, camDist: 5.35,
    getPack: getBearPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true, bobAmp: 0.008 },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.0, isCycle: true, bobAmp: 0.035 },
      { id: 'c_rear', label: '▶ Rugido', frames: ['rear0', 'rear1', 'rear2', 'rear3'], fps: 3.2, isCycle: true },
      { id: 'c_swipe', label: '▶ Patada', frames: ['swipe0', 'swipe1', 'swipe2', 'swipe3'], fps: 6.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'rear0', 'rear1', 'rear2', 'rear3',
      'swipe0', 'swipe1', 'swipe2', 'swipe3',
    ],
  }),
  fox: defineCreature<FoxPoseName>({
    key: 'fox', label: 'Raposa',
    pw: FOX_PW, ph: FOX_PH, ppu: ANIMAL_PPU, worldW: FOX_W, worldH: FOX_H,
    centerY: 0.42, camDist: 2.1,
    getPack: getFoxPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true, bobAmp: 0.005 },
      { id: 'c_sniff', label: '▶ Farejando', frames: ['sniff0', 'sniff1', 'sniff2', 'sniff3'], fps: 3.6, isCycle: true },
      { id: 'c_run', label: '▶ Corrida', frames: ['run0', 'run1', 'run2', 'run3', 'run4', 'run5'], fps: 10.0, isCycle: true, bobAmp: 0.03 },
      { id: 'c_pounce', label: '▶ Bote', frames: ['pounce0', 'pounce1', 'pounce2', 'pounce3'], fps: 6.5, isCycle: true, hopAmp: 0.22 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'sniff0', 'sniff1', 'sniff2', 'sniff3',
      'run0', 'run1', 'run2', 'run3', 'run4', 'run5',
      'pounce0', 'pounce1', 'pounce2', 'pounce3',
    ],
  }),
  frog: defineCreature<FrogPoseName>({
    key: 'frog', label: 'Sapo',
    pw: FROG_PW, ph: FROG_PH, ppu: ANIMAL_PPU, worldW: FROG_W, worldH: FROG_H,
    centerY: 0.16, camDist: 1.35,
    getPack: getFrogPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_croak', label: '▶ Coaxar', frames: ['croak0', 'croak1', 'croak2', 'croak3'], fps: 4.2, isCycle: true },
      { id: 'c_jump', label: '▶ Pulo', frames: ['jump0', 'jump1', 'jump2', 'jump3'], fps: 6.5, isCycle: true, hopAmp: 0.24 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'croak0', 'croak1', 'croak2', 'croak3',
      'jump0', 'jump1', 'jump2', 'jump3',
    ],
  }),
  turtle: defineCreature<TurtlePoseName>({
    key: 'turtle', label: 'Tartaruga',
    pw: TURTLE_PW, ph: TURTLE_PH, ppu: ANIMAL_PPU, worldW: TURTLE_W, worldH: TURTLE_H,
    centerY: 0.18, camDist: 1.45,
    getPack: getTurtlePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.6, isCycle: true },
      { id: 'c_walk', label: '▶ Rastejar', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 4.2, isCycle: true, bobAmp: 0.008 },
      { id: 'c_shell', label: '▶ Casco', frames: ['shell0', 'shell1', 'shell2', 'shell1'], fps: 2.6, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'shell0', 'shell1', 'shell2',
    ],
  }),
  owl: defineCreature<OwlPoseName>({
    key: 'owl', label: 'Coruja',
    pw: OWL_PW, ph: OWL_PH, ppu: ANIMAL_PPU, worldW: OWL_W, worldH: OWL_H,
    centerY: 0.28, camDist: 1.5,
    getPack: getOwlPosePack,
    anims: [
      { id: 'c_perch', label: '▶ Empoleirada', frames: ['perch0', 'perch1', 'perch0', 'perch2'], fps: 2.0, isCycle: true },
      { id: 'c_hoot', label: '▶ Pio', frames: ['hoot0', 'hoot1', 'hoot2', 'hoot3'], fps: 3.6, isCycle: true },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3'], fps: 9.5, isCycle: true, hopAmp: 0.16 },
      { id: 'c_glide', label: '▶ Planando', frames: ['glide0', 'glide1'], fps: 3.0, isCycle: true, bobAmp: 0.04 },
    ],
    poses: [
      'perch0', 'perch1', 'perch2',
      'hoot0', 'hoot1', 'hoot2', 'hoot3',
      'flap0', 'flap1', 'flap2', 'flap3',
      'glide0', 'glide1',
    ],
  }),
  squirrel: defineCreature<SquirrelPoseName>({
    key: 'squirrel', label: 'Esquilo',
    pw: SQUIRREL_PW, ph: SQUIRREL_PH, ppu: ANIMAL_PPU, worldW: SQUIRREL_W, worldH: SQUIRREL_H,
    centerY: 0.22, camDist: 1.35,
    getPack: getSquirrelPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.6, isCycle: true },
      { id: 'c_nibble', label: '▶ Roendo', frames: ['nibble0', 'nibble1', 'nibble2', 'nibble3'], fps: 6.0, isCycle: true },
      { id: 'c_hop', label: '▶ Saltos', frames: ['hop0', 'hop1', 'hop2', 'hop3'], fps: 9.5, isCycle: true, hopAmp: 0.18 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'nibble0', 'nibble1', 'nibble2', 'nibble3',
      'hop0', 'hop1', 'hop2', 'hop3',
    ],
  }),
  badger: defineCreature<BadgerPoseName>({
    key: 'badger', label: 'Texugo',
    pw: BADGER_PW, ph: BADGER_PH, ppu: ANIMAL_PPU, worldW: BADGER_W, worldH: BADGER_H,
    centerY: 0.24, camDist: 1.65,
    getPack: getBadgerPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_dig', label: '▶ Cavando', frames: ['dig0', 'dig1', 'dig2', 'dig3'], fps: 5.5, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_hiss', label: '▶ Ameaça', frames: ['hiss0', 'hiss1', 'hiss2'], fps: 5.0, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'dig0', 'dig1', 'dig2', 'dig3',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'hiss0', 'hiss1', 'hiss2',
    ],
  }),
  duck: defineCreature<DuckPoseName>({
    key: 'duck', label: 'Pato',
    pw: DUCK_PW, ph: DUCK_PH, ppu: ANIMAL_PPU, worldW: DUCK_W, worldH: DUCK_H,
    centerY: 0.25, camDist: 1.45,
    getPack: getDuckPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_quack', label: '▶ Grasnar', frames: ['quack0', 'quack1', 'quack2'], fps: 5.5, isCycle: true },
      { id: 'c_waddle', label: '▶ Andando', frames: ['waddle0', 'waddle1', 'waddle2', 'waddle3', 'waddle4', 'waddle5'], fps: 7.5, isCycle: true, bobAmp: 0.018 },
      { id: 'c_flap', label: '▶ Voando', frames: ['flap0', 'flap1', 'flap2', 'flap3'], fps: 10.5, isCycle: true, hopAmp: 0.14 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'quack0', 'quack1', 'quack2',
      'waddle0', 'waddle1', 'waddle2', 'waddle3', 'waddle4', 'waddle5',
      'flap0', 'flap1', 'flap2', 'flap3',
    ],
  }),
  snake: defineCreature<SnakePoseName>({
    key: 'snake', label: 'Cobra',
    pw: SNAKE_PW, ph: SNAKE_PH, ppu: ANIMAL_PPU, worldW: SNAKE_W, worldH: SNAKE_H,
    centerY: 0.18, camDist: 1.55,
    getPack: getSnakePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_slither', label: '▶ Rastejando', frames: ['slither0', 'slither1', 'slither2', 'slither3', 'slither4', 'slither5'], fps: 8.0, isCycle: true },
      { id: 'c_coil', label: '▶ Enrolada', frames: ['coil0', 'coil1', 'coil2'], fps: 4.0, isCycle: true },
      { id: 'c_strike', label: '▶ Bote', frames: ['strike0', 'strike1', 'strike2'], fps: 8.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'slither0', 'slither1', 'slither2', 'slither3', 'slither4', 'slither5',
      'coil0', 'coil1', 'coil2',
      'strike0', 'strike1', 'strike2',
    ],
  }),
  goat: defineCreature<GoatPoseName>({
    key: 'goat', label: 'Cabra',
    pw: GOAT_PW, ph: GOAT_PH, ppu: ANIMAL_PPU, worldW: GOAT_W, worldH: GOAT_H,
    centerY: 0.4, camDist: 2.05,
    getPack: getGoatPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true, bobAmp: 0.005 },
      { id: 'c_graze', label: '▶ Pastando', frames: ['graze0', 'graze1', 'graze2', 'graze1'], fps: 3.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true, bobAmp: 0.025 },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 10.5, isCycle: true, bobAmp: 0.035 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'graze0', 'graze1', 'graze2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  sheep: defineCreature<SheepPoseName>({
    key: 'sheep', label: 'Ovelha',
    pw: SHEEP_PW, ph: SHEEP_PH, ppu: ANIMAL_PPU, worldW: SHEEP_W, worldH: SHEEP_H,
    centerY: 0.34, camDist: 1.85,
    getPack: getSheepPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_graze', label: '▶ Pastando', frames: ['graze0', 'graze1', 'graze2', 'graze1'], fps: 3.0, isCycle: true },
      { id: 'c_flee', label: '▶ Fuga', frames: ['flee0', 'flee1', 'flee2', 'flee3'], fps: 10.0, isCycle: true, hopAmp: 0.14 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'graze0', 'graze1', 'graze2',
      'flee0', 'flee1', 'flee2', 'flee3',
    ],
  }),
  pig: defineCreature<PigPoseName>({
    key: 'pig', label: 'Porco',
    pw: PIG_PW, ph: PIG_PH, ppu: ANIMAL_PPU, worldW: PIG_W, worldH: PIG_H,
    centerY: 0.3, camDist: 1.75,
    getPack: getPigPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Trote', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_sniff', label: '▶ Farejando', frames: ['sniff0', 'sniff1', 'sniff2', 'sniff1'], fps: 4.5, isCycle: true },
      { id: 'c_flee', label: '▶ Fuga', frames: ['flee0', 'flee1', 'flee2', 'flee3'], fps: 10.5, isCycle: true, bobAmp: 0.03 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sniff0', 'sniff1', 'sniff2',
      'flee0', 'flee1', 'flee2', 'flee3',
    ],
  }),
  hedgehog: defineCreature<HedgehogPoseName>({
    key: 'hedgehog', label: 'Ouriço',
    pw: HEDGEHOG_PW, ph: HEDGEHOG_PH, ppu: ANIMAL_PPU, worldW: HEDGEHOG_W, worldH: HEDGEHOG_H,
    centerY: 0.18, camDist: 1.3,
    getPack: getHedgehogPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true, bobAmp: 0.01 },
      { id: 'c_curl', label: '▶ Bola', frames: ['curl0', 'curl1', 'curl2'], fps: 3.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'curl0', 'curl1', 'curl2',
    ],
  }),
  crab: defineCreature<CrabPoseName>({
    key: 'crab', label: 'Caranguejo',
    pw: CRAB_PW, ph: CRAB_PH, ppu: ANIMAL_PPU, worldW: CRAB_W, worldH: CRAB_H,
    centerY: 0.2, camDist: 1.4,
    getPack: getCrabPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_scuttle', label: '▶ Lateral', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 9.0, isCycle: true, bobAmp: 0.012 },
      { id: 'c_snap', label: '▶ Pinça', frames: ['snap0', 'snap1', 'snap2'], fps: 6.0, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5',
      'snap0', 'snap1', 'snap2',
    ],
  }),
  eagle: defineCreature<EaglePoseName>({
    key: 'eagle', label: 'Águia',
    pw: EAGLE_PW, ph: EAGLE_PH, ppu: ANIMAL_PPU, worldW: EAGLE_W, worldH: EAGLE_H,
    centerY: 0.36, camDist: 2.1,
    getPack: getEaglePosePack,
    anims: [
      { id: 'c_glide', label: '▶ Planando', frames: ['glide0', 'glide1', 'glide2'], fps: 2.6, isCycle: true, bobAmp: 0.04 },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 8.5, isCycle: true, hopAmp: 0.12 },
      { id: 'c_swoop', label: '▶ Rasante', frames: ['swoop0', 'swoop1', 'swoop2'], fps: 5.5, isCycle: true },
    ],
    poses: [
      'glide0', 'glide1', 'glide2',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
      'swoop0', 'swoop1', 'swoop2',
    ],
  }),
  panther: defineCreature<PantherPoseName>({
    key: 'panther', label: 'Pantera',
    pw: PANTHER_PW, ph: PANTHER_PH, ppu: ANIMAL_PPU, worldW: PANTHER_W, worldH: PANTHER_H,
    centerY: 0.38, camDist: 2.15,
    getPack: getPantherPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_prowl', label: '▶ Espreita', frames: ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'], fps: 8.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_pounce', label: '▶ Bote', frames: ['pounce0', 'pounce1', 'pounce2', 'pounce3'], fps: 7.0, isCycle: true, hopAmp: 0.18 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5',
      'pounce0', 'pounce1', 'pounce2', 'pounce3',
    ],
  }),
  crow: defineCreature<CrowPoseName>({
    key: 'crow', label: 'Corvo',
    pw: CROW_PW, ph: CROW_PH, ppu: ANIMAL_PPU, worldW: CROW_W, worldH: CROW_H,
    centerY: 0.24, camDist: 1.4,
    getPack: getCrowPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_hop', label: '▶ Pulos', frames: ['hop0', 'hop1', 'hop2', 'hop3'], fps: 8.5, isCycle: true, hopAmp: 0.14 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck1'], fps: 5.5, isCycle: true },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 10.0, isCycle: true, hopAmp: 0.12 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'hop0', 'hop1', 'hop2', 'hop3',
      'peck0', 'peck1', 'peck2',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
    ],
  }),
  traveler: defineCreature<TravelerPose>({
    key: 'traveler', label: 'Bento, o viajante',
    pw: TRAVELER_PX, ph: TRAVELER_PX, ppu: TRAVELER_PX / TRAVELER_SIZE,
    worldW: TRAVELER_SIZE, worldH: TRAVELER_SIZE, centerY: TRAVELER_CENTER, camDist: 3.65,
    getPack: buildTravelerPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Parado', frames: [...TRAVELER_IDLE], fps: TRAVELER_IDLE_FPS, isCycle: true },
      { id: 'c_talk', label: '▶ Conversando', frames: [...TRAVELER_TALK], fps: TRAVELER_TALK_FPS, isCycle: true },
    ],
    poses: [...TRAVELER_IDLE, ...TRAVELER_TALK],
  }),
  pill_bug: defineCreature<PillBugPose>({
    key: 'pill_bug', label: 'Tatuzinho-de-jardim',
    pw: PILLBUG_PW, ph: PILLBUG_PH, ppu: ANIMAL_PPU, worldW: PILLBUG_W, worldH: PILLBUG_H,
    centerY: .15, camDist: .86,
    getPack: getPillBugPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Parado', frames: [...PILLBUG_IDLE], fps: 2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: [...PILLBUG_WALK], fps: 9, isCycle: true },
      { id: 'c_curl', label: '▶ Enrolar', frames: ['idle0', ...PILLBUG_CURL, 'curl3', 'curl3', 'curl2', 'curl1', 'curl0'], fps: 7, isCycle: true },
    ],
    poses: [...PILLBUG_IDLE, ...PILLBUG_WALK, ...PILLBUG_CURL],
  }),
  beetle: defineCreature<BeetlePoseName>({
    key: 'beetle', label: 'Besouro',
    pw: BEETLE_PW, ph: BEETLE_PH, ppu: ANIMAL_PPU, worldW: BEETLE_W, worldH: BEETLE_H,
    centerY: 0.14, camDist: 1.15,
    getPack: getBeetlePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 9.0, isCycle: true, bobAmp: 0.008 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
    ],
  }),
  butterfly: defineCreature<ButterflyPoseName>({
    key: 'butterfly', label: 'Borboleta',
    pw: BUTTERFLY_PW, ph: BUTTERFLY_PH, ppu: ANIMAL_PPU, worldW: BUTTERFLY_W, worldH: BUTTERFLY_H,
    centerY: 0.22, camDist: 1.15,
    getPack: getButterflyPosePack,
    anims: [
      { id: 'c_flutter', label: '▶ Voando', frames: ['flutter0', 'flutter1', 'flutter2', 'flutter3', 'flutter4', 'flutter5'], fps: 10.0, isCycle: true, bobAmp: 0.06 },
    ],
    poses: ['flutter0', 'flutter1', 'flutter2', 'flutter3', 'flutter4', 'flutter5'],
  }),
  bee: defineCreature<BeePoseName>({
    key: 'bee', label: 'Abelha',
    pw: BEE_PW, ph: BEE_PH, ppu: ANIMAL_PPU, worldW: BEE_W, worldH: BEE_H,
    centerY: 0.2, camDist: 1.05,
    getPack: getBeePosePack,
    anims: [
      { id: 'c_buzz', label: '▶ Zumbindo', frames: ['buzz0', 'buzz1', 'buzz2', 'buzz3'], fps: 14.0, isCycle: true, bobAmp: 0.05 },
    ],
    poses: ['buzz0', 'buzz1', 'buzz2', 'buzz3'],
  }),
  dragonfly: defineCreature<DragonflyPoseName>({
    key: 'dragonfly', label: 'Libélula',
    pw: DRAGONFLY_PW, ph: DRAGONFLY_PH, ppu: ANIMAL_PPU, worldW: DRAGONFLY_W, worldH: DRAGONFLY_H,
    centerY: 0.2, camDist: 1.25,
    getPack: getDragonflyPosePack,
    anims: [
      { id: 'c_hover', label: '▶ Pairando', frames: ['hover0', 'hover1', 'hover2', 'hover3'], fps: 12.0, isCycle: true, bobAmp: 0.04 },
      { id: 'c_dart', label: '▶ Disparo', frames: ['dart0', 'dart1', 'dart2', 'dart3'], fps: 14.0, isCycle: true, bobAmp: 0.03 },
    ],
    poses: ['hover0', 'hover1', 'hover2', 'hover3', 'dart0', 'dart1', 'dart2', 'dart3'],
  }),
  red_panda: defineCreature<RedPandaPoseName>({
    key: 'red_panda', label: 'Panda Vermelho',
    pw: RED_PANDA_PW, ph: RED_PANDA_PH, ppu: ANIMAL_PPU, worldW: RED_PANDA_W, worldH: RED_PANDA_H,
    centerY: 0.28, camDist: 1.75,
    getPack: getRedPandaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.018 },
      { id: 'c_curious', label: '▶ Curioso', frames: ['curious0', 'curious1', 'curious2', 'curious1'], fps: 3.6, isCycle: true },
      { id: 'c_flee', label: '▶ Fuga', frames: ['flee0', 'flee1', 'flee2', 'flee3'], fps: 10.5, isCycle: true, hopAmp: 0.14 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'curious0', 'curious1', 'curious2',
      'flee0', 'flee1', 'flee2', 'flee3',
    ],
  }),
  giant_panda: defineCreature<GiantPandaPoseName>({
    key: 'giant_panda', label: 'Panda',
    pw: GIANT_PANDA_PW, ph: GIANT_PANDA_PH, ppu: ANIMAL_PPU, worldW: GIANT_PANDA_W, worldH: GIANT_PANDA_H,
    centerY: 0.5, camDist: 2.6,
    getPack: getGiantPandaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_sit', label: '▶ Bambu', frames: ['sit0', 'sit1', 'sit2', 'sit1'], fps: 2.8, isCycle: true },
      { id: 'c_roll', label: '▶ Cambalhota', frames: ['roll0', 'roll1', 'roll2', 'roll3'], fps: 8.0, isCycle: true, bobAmp: 0.04 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sit0', 'sit1', 'sit2',
      'roll0', 'roll1', 'roll2', 'roll3',
    ],
  }),
  polar_bear: defineCreature<PolarBearPoseName>({
    key: 'polar_bear', label: 'Urso Polar',
    pw: POLAR_BEAR_PW, ph: POLAR_BEAR_PH, ppu: ANIMAL_PPU, worldW: POLAR_BEAR_W, worldH: POLAR_BEAR_H,
    centerY: 0.56, camDist: 2.95,
    getPack: getPolarBearPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.0, isCycle: true, bobAmp: 0.03 },
      { id: 'c_rear', label: '▶ Rugido', frames: ['rear0', 'rear1', 'rear2', 'rear3'], fps: 3.2, isCycle: true },
      { id: 'c_swipe', label: '▶ Patada', frames: ['swipe0', 'swipe1', 'swipe2', 'swipe3'], fps: 6.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'rear0', 'rear1', 'rear2', 'rear3',
      'swipe0', 'swipe1', 'swipe2', 'swipe3',
    ],
  }),
  spectacled_bear: defineCreature<SpectacledBearPoseName>({
    key: 'spectacled_bear', label: 'Urso de Óculos',
    pw: SPECTACLED_BEAR_PW, ph: SPECTACLED_BEAR_PH, ppu: ANIMAL_PPU, worldW: SPECTACLED_BEAR_W, worldH: SPECTACLED_BEAR_H,
    centerY: 0.48, camDist: 2.55,
    getPack: getSpectacledBearPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_forage', label: '▶ Farejando', frames: ['forage0', 'forage1', 'forage2', 'forage1'], fps: 3.4, isCycle: true },
      { id: 'c_rear', label: '▶ Em pé', frames: ['rear0', 'rear1', 'rear2', 'rear3'], fps: 3.2, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'forage0', 'forage1', 'forage2',
      'rear0', 'rear1', 'rear2', 'rear3',
    ],
  }),
  cheetah: defineCreature<CheetahPoseName>({
    key: 'cheetah', label: 'Guepardo',
    pw: CHEETAH_PW, ph: CHEETAH_PH, ppu: ANIMAL_PPU, worldW: CHEETAH_W, worldH: CHEETAH_H,
    centerY: 0.4, camDist: 2.25,
    getPack: getCheetahPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Espreita', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_sprint', label: '▶ Disparada', frames: ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'], fps: 13.0, isCycle: true, bobAmp: 0.04 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5',
    ],
  }),
  jaguar: defineCreature<JaguarPoseName>({
    key: 'jaguar', label: 'Onça-Pintada',
    pw: JAGUAR_PW, ph: JAGUAR_PH, ppu: ANIMAL_PPU, worldW: JAGUAR_W, worldH: JAGUAR_H,
    centerY: 0.38, camDist: 2.2,
    getPack: getJaguarPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_prowl', label: '▶ Espreita', frames: ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'], fps: 8.0, isCycle: true, bobAmp: 0.02 },
      { id: 'c_pounce', label: '▶ Bote', frames: ['pounce0', 'pounce1', 'pounce2', 'pounce3'], fps: 7.5, isCycle: true, hopAmp: 0.18 },
      { id: 'c_roar', label: '▶ Rugido', frames: ['roar0', 'roar1', 'roar2', 'roar1'], fps: 3.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5',
      'pounce0', 'pounce1', 'pounce2', 'pounce3',
      'roar0', 'roar1', 'roar2',
    ],
  }),
  tasmanian_devil: defineCreature<TasmanianDevilPoseName>({
    key: 'tasmanian_devil', label: 'Diabo-da-Tasmânia',
    pw: TASMANIAN_DEVIL_PW, ph: TASMANIAN_DEVIL_PH, ppu: ANIMAL_PPU, worldW: TASMANIAN_DEVIL_W, worldH: TASMANIAN_DEVIL_H,
    centerY: 0.24, camDist: 1.55,
    getPack: getTasmanianDevilPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Trote', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.018 },
      { id: 'c_snarl', label: '▶ Rosnado', frames: ['snarl0', 'snarl1', 'snarl2', 'snarl1'], fps: 5.5, isCycle: true },
      { id: 'c_lunge', label: '▶ Bote', frames: ['lunge0', 'lunge1', 'lunge2', 'lunge3'], fps: 9.0, isCycle: true, hopAmp: 0.14 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'snarl0', 'snarl1', 'snarl2',
      'lunge0', 'lunge1', 'lunge2', 'lunge3',
    ],
  }),
  weasel: defineCreature<WeaselPoseName>({
    key: 'weasel', label: 'Fuinha',
    pw: WEASEL_PW, ph: WEASEL_PH, ppu: ANIMAL_PPU, worldW: WEASEL_W, worldH: WEASEL_H,
    centerY: 0.2, camDist: 1.4,
    getPack: getWeaselPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.6, isCycle: true },
      { id: 'c_bound', label: '▶ Saltos', frames: ['bound0', 'bound1', 'bound2', 'bound3', 'bound4', 'bound5'], fps: 10.5, isCycle: true, hopAmp: 0.14 },
      { id: 'c_perk', label: '▶ Alerta', frames: ['perk0', 'perk1', 'perk2', 'perk1'], fps: 3.6, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'bound0', 'bound1', 'bound2', 'bound3', 'bound4', 'bound5',
      'perk0', 'perk1', 'perk2',
    ],
  }),
  otter: defineCreature<OtterPoseName>({
    key: 'otter', label: 'Lontra',
    pw: OTTER_PW, ph: OTTER_PH, ppu: ANIMAL_PPU, worldW: OTTER_W, worldH: OTTER_H,
    centerY: 0.22, camDist: 1.65,
    getPack: getOtterPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.018 },
      { id: 'c_swim', label: '▶ Nadando', frames: ['swim0', 'swim1', 'swim2', 'swim3'], fps: 7.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_play', label: '▶ Brincando', frames: ['play0', 'play1', 'play2', 'play1'], fps: 3.6, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'swim0', 'swim1', 'swim2', 'swim3',
      'play0', 'play1', 'play2',
    ],
  }),
  flamingo: defineCreature<FlamingoPoseName>({
    key: 'flamingo', label: 'Flamingo',
    pw: FLAMINGO_PW, ph: FLAMINGO_PH, ppu: ANIMAL_PPU, worldW: FLAMINGO_W, worldH: FLAMINGO_H,
    centerY: 0.56, camDist: 2.55,
    getPack: getFlamingoPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_oneleg', label: '▶ Uma Perna', frames: ['oneleg0', 'oneleg1', 'oneleg2', 'oneleg1'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_dip', label: '▶ Filtrando', frames: ['dip0', 'dip1', 'dip2', 'dip1'], fps: 3.0, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'oneleg0', 'oneleg1', 'oneleg2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'dip0', 'dip1', 'dip2',
    ],
  }),
  hippo: defineCreature<HippoPoseName>({
    key: 'hippo', label: 'Hipopótamo',
    pw: HIPPO_PW, ph: HIPPO_PH, ppu: ANIMAL_PPU, worldW: HIPPO_W, worldH: HIPPO_H,
    centerY: 0.48, camDist: 2.95,
    getPack: getHippoPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.0, isCycle: true, bobAmp: 0.025 },
      { id: 'c_yawn', label: '▶ Bocejo', frames: ['yawn0', 'yawn1', 'yawn2', 'yawn1'], fps: 2.6, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 9.5, isCycle: true, bobAmp: 0.035 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'yawn0', 'yawn1', 'yawn2',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  elephant: defineCreature<ElephantPoseName>({
    key: 'elephant', label: 'Elefante',
    pw: ELEPHANT_PW, ph: ELEPHANT_PH, ppu: ANIMAL_PPU, worldW: ELEPHANT_W, worldH: ELEPHANT_H,
    centerY: 0.68, camDist: 3.55,
    getPack: getElephantPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Marcha', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 5.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_trumpet', label: '▶ Trombeta', frames: ['trumpet0', 'trumpet1', 'trumpet2', 'trumpet1'], fps: 3.0, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 8.5, isCycle: true, bobAmp: 0.04 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'trumpet0', 'trumpet1', 'trumpet2',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  lion: defineCreature<LionPoseName>({
    key: 'lion', label: 'Leão',
    pw: LION_PW, ph: LION_PH, ppu: ANIMAL_PPU, worldW: LION_W, worldH: LION_H,
    centerY: 0.44, camDist: 2.5,
    getPack: getLionPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_roar', label: '▶ Rugido', frames: ['roar0', 'roar1', 'roar2', 'roar1'], fps: 3.2, isCycle: true },
      { id: 'c_pounce', label: '▶ Bote', frames: ['pounce0', 'pounce1', 'pounce2', 'pounce3'], fps: 8.0, isCycle: true, hopAmp: 0.18 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'roar0', 'roar1', 'roar2',
      'pounce0', 'pounce1', 'pounce2', 'pounce3',
    ],
  }),
  tiger: defineCreature<TigerPoseName>({
    key: 'tiger', label: 'Tigre',
    pw: TIGER_PW, ph: TIGER_PH, ppu: ANIMAL_PPU, worldW: TIGER_W, worldH: TIGER_H,
    centerY: 0.42, camDist: 2.45,
    getPack: getTigerPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_prowl', label: '▶ Espreita', frames: ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'], fps: 8.0, isCycle: true, bobAmp: 0.02 },
      { id: 'c_roar', label: '▶ Rugido', frames: ['roar0', 'roar1', 'roar2', 'roar1'], fps: 3.4, isCycle: true },
      { id: 'c_pounce', label: '▶ Bote', frames: ['pounce0', 'pounce1', 'pounce2', 'pounce3'], fps: 8.0, isCycle: true, hopAmp: 0.18 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5',
      'roar0', 'roar1', 'roar2',
      'pounce0', 'pounce1', 'pounce2', 'pounce3',
    ],
  }),
  king_crab: defineCreature<KingCrabPoseName>({
    key: 'king_crab', label: 'Caranguejo-Rei',
    pw: KING_CRAB_PW, ph: KING_CRAB_PH, ppu: ANIMAL_PPU, worldW: KING_CRAB_W, worldH: KING_CRAB_H,
    centerY: 0.34, camDist: 2.2,
    getPack: getKingCrabPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_scuttle', label: '▶ Lateral', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 8.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_snap', label: '▶ Pinça', frames: ['snap0', 'snap1', 'snap2', 'snap1'], fps: 5.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5',
      'snap0', 'snap1', 'snap2',
    ],
  }),
  octopus: defineCreature<OctopusPoseName>({
    key: 'octopus', label: 'Polvo',
    pw: OCTOPUS_PW, ph: OCTOPUS_PH, ppu: ANIMAL_PPU, worldW: OCTOPUS_W, worldH: OCTOPUS_H,
    centerY: 0.36, camDist: 2.0,
    getPack: getOctopusPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true, bobAmp: 0.02 },
      { id: 'c_crawl', label: '▶ Nado', frames: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'], fps: 7.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_jet', label: '▶ Jato', frames: ['jet0', 'jet1', 'jet2', 'jet3'], fps: 10.5, isCycle: true, bobAmp: 0.03 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5',
      'jet0', 'jet1', 'jet2', 'jet3',
    ],
  }),
  squid: defineCreature<SquidPoseName>({
    key: 'squid', label: 'Lula',
    pw: SQUID_PW, ph: SQUID_PH, ppu: ANIMAL_PPU, worldW: SQUID_W, worldH: SQUID_H,
    centerY: 0.28, camDist: 1.85,
    getPack: getSquidPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true, bobAmp: 0.02 },
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 8.0, isCycle: true, bobAmp: 0.025 },
      { id: 'c_dart', label: '▶ Jato', frames: ['dart0', 'dart1', 'dart2', 'dart3'], fps: 11.0, isCycle: true, bobAmp: 0.03 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5',
      'dart0', 'dart1', 'dart2', 'dart3',
    ],
  }),
  lobster: defineCreature<LobsterPoseName>({
    key: 'lobster', label: 'Lagosta',
    pw: LOBSTER_PW, ph: LOBSTER_PH, ppu: ANIMAL_PPU, worldW: LOBSTER_W, worldH: LOBSTER_H,
    centerY: 0.22, camDist: 1.75,
    getPack: getLobsterPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true, bobAmp: 0.012 },
      { id: 'c_snap', label: '▶ Pinça', frames: ['snap0', 'snap1', 'snap2', 'snap1'], fps: 5.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'snap0', 'snap1', 'snap2',
    ],
  }),
  dolphin: defineCreature<DolphinPoseName>({
    key: 'dolphin', label: 'Golfinho',
    pw: DOLPHIN_PW, ph: DOLPHIN_PH, ppu: ANIMAL_PPU, worldW: DOLPHIN_W, worldH: DOLPHIN_H,
    centerY: 0.34, camDist: 2.35,
    getPack: getDolphinPosePack,
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 8.5, isCycle: true, bobAmp: 0.03 },
      { id: 'c_leap', label: '▶ Salto', frames: ['leap0', 'leap1', 'leap2', 'leap3'], fps: 7.5, isCycle: true, hopAmp: 0.24 },
    ],
    poses: [
      'swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5',
      'leap0', 'leap1', 'leap2', 'leap3',
    ],
  }),
  pink_dolphin: defineCreature<PinkDolphinPoseName>({
    key: 'pink_dolphin', label: 'Boto-Cor-de-Rosa',
    pw: PINK_DOLPHIN_PW, ph: PINK_DOLPHIN_PH, ppu: ANIMAL_PPU, worldW: PINK_DOLPHIN_W, worldH: PINK_DOLPHIN_H,
    centerY: 0.34, camDist: 2.35,
    getPack: getPinkDolphinPosePack,
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 8.5, isCycle: true, bobAmp: 0.03 },
      { id: 'c_leap', label: '▶ Salto', frames: ['leap0', 'leap1', 'leap2', 'leap3'], fps: 7.5, isCycle: true, hopAmp: 0.24 },
    ],
    poses: [
      'swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5',
      'leap0', 'leap1', 'leap2', 'leap3',
    ],
  }),
  horse: defineCreature<HorsePoseName>({
    key: 'horse', label: 'Cavalo',
    pw: HORSE_PW, ph: HORSE_PH, ppu: ANIMAL_PPU, worldW: HORSE_W, worldH: HORSE_H,
    centerY: 0.62, camDist: 3.1,
    getPack: getHorsePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_trot', label: '▶ Trote', frames: ['trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5'], fps: 8.5, isCycle: true, bobAmp: 0.03 },
      { id: 'c_gallop', label: '▶ Galope', frames: ['gallop0', 'gallop1', 'gallop2', 'gallop3', 'gallop4', 'gallop5'], fps: 12.0, isCycle: true, bobAmp: 0.045 },
      { id: 'c_rear', label: '▶ Empinar', frames: ['rear0', 'rear1', 'rear2', 'rear1'], fps: 3.2, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5',
      'gallop0', 'gallop1', 'gallop2', 'gallop3', 'gallop4', 'gallop5',
      'rear0', 'rear1', 'rear2',
    ],
  }),
  donkey: defineCreature<DonkeyPoseName>({
    key: 'donkey', label: 'Burro',
    pw: DONKEY_PW, ph: DONKEY_PH, ppu: ANIMAL_PPU, worldW: DONKEY_W, worldH: DONKEY_H,
    centerY: 0.52, camDist: 2.65,
    getPack: getDonkeyPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_bray', label: '▶ Zurro', frames: ['bray0', 'bray1', 'bray2', 'bray1'], fps: 3.4, isCycle: true },
      { id: 'c_kick', label: '▶ Coice', frames: ['kick0', 'kick1', 'kick2', 'kick1'], fps: 6.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'bray0', 'bray1', 'bray2',
      'kick0', 'kick1', 'kick2',
    ],
  }),
  baboon: defineCreature<BaboonPoseName>({
    key: 'baboon', label: 'Babuíno',
    pw: BABOON_PW, ph: BABOON_PH, ppu: ANIMAL_PPU, worldW: BABOON_W, worldH: BABOON_H,
    centerY: 0.4, camDist: 2.05,
    getPack: getBaboonPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_bark', label: '▶ Ameaça', frames: ['bark0', 'bark1', 'bark2', 'bark1'], fps: 5.0, isCycle: true },
      { id: 'c_lunge', label: '▶ Bote', frames: ['lunge0', 'lunge1', 'lunge2', 'lunge3'], fps: 8.5, isCycle: true, hopAmp: 0.16 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'bark0', 'bark1', 'bark2',
      'lunge0', 'lunge1', 'lunge2', 'lunge3',
    ],
  }),
  gorilla: defineCreature<GorillaPoseName>({
    key: 'gorilla', label: 'Gorila',
    pw: GORILLA_PW, ph: GORILLA_PH, ppu: ANIMAL_PPU, worldW: GORILLA_W, worldH: GORILLA_H,
    centerY: 0.56, camDist: 2.85,
    getPack: getGorillaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_beat', label: '▶ Peito', frames: ['beat0', 'beat1', 'beat2', 'beat3'], fps: 7.5, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 9.5, isCycle: true, bobAmp: 0.035 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'beat0', 'beat1', 'beat2', 'beat3',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  golden_lion_tamarin: defineCreature<GoldenLionTamarinPoseName>({
    key: 'golden_lion_tamarin', label: 'Mico-Leão-Dourado',
    pw: TAMARIN_PW, ph: TAMARIN_PH, ppu: ANIMAL_PPU, worldW: TAMARIN_W, worldH: TAMARIN_H,
    centerY: 0.24, camDist: 1.4,
    getPack: getGoldenLionTamarinPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.6, isCycle: true },
      { id: 'c_hop', label: '▶ Saltos', frames: ['hop0', 'hop1', 'hop2', 'hop3', 'hop4', 'hop5'], fps: 10.0, isCycle: true, hopAmp: 0.16 },
      { id: 'c_perch', label: '▶ Alerta', frames: ['perch0', 'perch1', 'perch2', 'perch1'], fps: 3.4, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'hop0', 'hop1', 'hop2', 'hop3', 'hop4', 'hop5',
      'perch0', 'perch1', 'perch2',
    ],
  }),
  chimpanzee: defineCreature<ChimpanzeePoseName>({
    key: 'chimpanzee', label: 'Chimpanzé',
    pw: CHIMP_PW, ph: CHIMP_PH, ppu: ANIMAL_PPU, worldW: CHIMP_W, worldH: CHIMP_H,
    centerY: 0.44, camDist: 2.2,
    getPack: getChimpanzeePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true, bobAmp: 0.02 },
      { id: 'c_hoot', label: '▶ Grito', frames: ['hoot0', 'hoot1', 'hoot2', 'hoot1'], fps: 5.5, isCycle: true },
      { id: 'c_leap', label: '▶ Salto', frames: ['leap0', 'leap1', 'leap2', 'leap3'], fps: 8.5, isCycle: true, hopAmp: 0.18 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'hoot0', 'hoot1', 'hoot2',
      'leap0', 'leap1', 'leap2', 'leap3',
    ],
  }),
  orangutan: defineCreature<OrangutanPoseName>({
    key: 'orangutan', label: 'Orangotango',
    pw: ORANGUTAN_PW, ph: ORANGUTAN_PH, ppu: ANIMAL_PPU, worldW: ORANGUTAN_W, worldH: ORANGUTAN_H,
    centerY: 0.52, camDist: 2.65,
    getPack: getOrangutanPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.0, isCycle: true, bobAmp: 0.02 },
      { id: 'c_sit', label: '▶ Sentado', frames: ['sit0', 'sit1', 'sit2', 'sit1'], fps: 2.2, isCycle: true },
      { id: 'c_reach', label: '▶ Alcançar', frames: ['reach0', 'reach1', 'reach2', 'reach1'], fps: 3.4, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sit0', 'sit1', 'sit2',
      'reach0', 'reach1', 'reach2',
    ],
  }),
  vulture: defineCreature<VulturePoseName>({
    key: 'vulture', label: 'Urubu',
    pw: VULTURE_PW, ph: VULTURE_PH, ppu: ANIMAL_PPU, worldW: VULTURE_W, worldH: VULTURE_H,
    centerY: 0.4, camDist: 2.2,
    getPack: getVulturePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_hop', label: '▶ Passos', frames: ['hop0', 'hop1', 'hop2', 'hop3'], fps: 7.5, isCycle: true, hopAmp: 0.1 },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 8.5, isCycle: true, hopAmp: 0.12 },
      { id: 'c_glide', label: '▶ Planando', frames: ['glide0', 'glide1', 'glide2', 'glide1'], fps: 2.6, isCycle: true, bobAmp: 0.04 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'hop0', 'hop1', 'hop2', 'hop3',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
      'glide0', 'glide1', 'glide2',
    ],
  }),
  anteater: defineCreature<AnteaterPoseName>({
    key: 'anteater', label: 'Tamanduá-Bandeira',
    pw: ANTEATER_PW, ph: ANTEATER_PH, ppu: ANIMAL_PPU, worldW: ANTEATER_W, worldH: ANTEATER_H,
    centerY: 0.36, camDist: 2.55,
    getPack: getAnteaterPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.0, isCycle: true, bobAmp: 0.018 },
      { id: 'c_lick', label: '▶ Língua', frames: ['lick0', 'lick1', 'lick2', 'lick1'], fps: 6.5, isCycle: true },
      { id: 'c_defend', label: '▶ Defesa', frames: ['defend0', 'defend1', 'defend2', 'defend1'], fps: 3.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'lick0', 'lick1', 'lick2',
      'defend0', 'defend1', 'defend2',
    ],
  }),
  mary_river_turtle: defineCreature<MaryRiverTurtlePoseName>({
    key: 'mary_river_turtle', label: 'Tartaruga-do-Rio-Mary',
    pw: MARY_TURTLE_PW, ph: MARY_TURTLE_PH, ppu: ANIMAL_PPU, worldW: MARY_TURTLE_W, worldH: MARY_TURTLE_H,
    centerY: 0.22, camDist: 1.5,
    getPack: getMaryRiverTurtlePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 5.5, isCycle: true, bobAmp: 0.01 },
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3'], fps: 6.5, isCycle: true, bobAmp: 0.02 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'swim0', 'swim1', 'swim2', 'swim3',
    ],
  }),
  hyena: defineCreature<HyenaPoseName>({
    key: 'hyena', label: 'Hiena',
    pw: HYENA_PW, ph: HYENA_PH, ppu: ANIMAL_PPU, worldW: HYENA_W, worldH: HYENA_H,
    centerY: 0.4, camDist: 2.2,
    getPack: getHyenaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_prowl', label: '▶ Espreita', frames: ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'], fps: 8.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_laugh', label: '▶ Risada', frames: ['laugh0', 'laugh1', 'laugh2', 'laugh1'], fps: 5.5, isCycle: true },
      { id: 'c_bite', label: '▶ Mordida', frames: ['bite0', 'bite1', 'bite2', 'bite3'], fps: 8.5, isCycle: true, hopAmp: 0.14 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5',
      'laugh0', 'laugh1', 'laugh2',
      'bite0', 'bite1', 'bite2', 'bite3',
    ],
  }),
  buffalo: defineCreature<BuffaloPoseName>({
    key: 'buffalo', label: 'Búfalo',
    pw: BUFFALO_PW, ph: BUFFALO_PH, ppu: ANIMAL_PPU, worldW: BUFFALO_W, worldH: BUFFALO_H,
    centerY: 0.48, camDist: 2.8,
    getPack: getBuffaloPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Marcha', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_snort', label: '▶ Bufar', frames: ['snort0', 'snort1', 'snort2', 'snort1'], fps: 3.4, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 10.0, isCycle: true, bobAmp: 0.035 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'snort0', 'snort1', 'snort2',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  bison: defineCreature<BisonPoseName>({
    key: 'bison', label: 'Bisão',
    pw: BISON_PW, ph: BISON_PH, ppu: ANIMAL_PPU, worldW: BISON_W, worldH: BISON_H,
    centerY: 0.52, camDist: 2.9,
    getPack: getBisonPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Marcha', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_graze', label: '▶ Pastando', frames: ['graze0', 'graze1', 'graze2', 'graze1'], fps: 2.8, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 10.0, isCycle: true, bobAmp: 0.035 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'graze0', 'graze1', 'graze2',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  moose: defineCreature<MoosePoseName>({
    key: 'moose', label: 'Alce',
    pw: MOOSE_PW, ph: MOOSE_PH, ppu: ANIMAL_PPU, worldW: MOOSE_W, worldH: MOOSE_H,
    centerY: 0.65, camDist: 3.35,
    getPack: getMoosePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Marcha', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_graze', label: '▶ Pastando', frames: ['graze0', 'graze1', 'graze2', 'graze1'], fps: 2.8, isCycle: true },
      { id: 'c_charge', label: '▶ Investida', frames: ['charge0', 'charge1', 'charge2', 'charge3'], fps: 9.5, isCycle: true, bobAmp: 0.035 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'graze0', 'graze1', 'graze2',
      'charge0', 'charge1', 'charge2', 'charge3',
    ],
  }),
  toucan: defineCreature<ToucanPoseName>({
    key: 'toucan', label: 'Tucano',
    pw: TOUCAN_PW, ph: TOUCAN_PH, ppu: ANIMAL_PPU, worldW: TOUCAN_W, worldH: TOUCAN_H,
    centerY: 0.3, camDist: 1.75,
    getPack: getToucanPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_hop', label: '▶ Pulos', frames: ['hop0', 'hop1', 'hop2', 'hop3'], fps: 8.5, isCycle: true, hopAmp: 0.14 },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 9.5, isCycle: true, hopAmp: 0.12 },
      { id: 'c_glide', label: '▶ Planando', frames: ['glide0', 'glide1', 'glide2', 'glide1'], fps: 2.8, isCycle: true, bobAmp: 0.03 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'hop0', 'hop1', 'hop2', 'hop3',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
      'glide0', 'glide1', 'glide2',
    ],
  }),
  pigeon: defineCreature<PigeonPoseName>({
    key: 'pigeon', label: 'Pombo',
    pw: PIGEON_PW, ph: PIGEON_PH, ppu: ANIMAL_PPU, worldW: PIGEON_W, worldH: PIGEON_H,
    centerY: 0.22, camDist: 1.35,
    getPack: getPigeonPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck1'], fps: 5.5, isCycle: true },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 10.5, isCycle: true, hopAmp: 0.12 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'peck0', 'peck1', 'peck2',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
    ],
  }),
  parrot: defineCreature<ParrotPoseName>({
    key: 'parrot', label: 'Papagaio',
    pw: PARROT_PW, ph: PARROT_PH, ppu: ANIMAL_PPU, worldW: PARROT_W, worldH: PARROT_H,
    centerY: 0.32, camDist: 1.8,
    getPack: getParrotPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_hop', label: '▶ Pulos', frames: ['hop0', 'hop1', 'hop2', 'hop3'], fps: 8.5, isCycle: true, hopAmp: 0.14 },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 10.0, isCycle: true, hopAmp: 0.12 },
      { id: 'c_glide', label: '▶ Planando', frames: ['glide0', 'glide1', 'glide2', 'glide1'], fps: 2.8, isCycle: true, bobAmp: 0.03 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'hop0', 'hop1', 'hop2', 'hop3',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
      'glide0', 'glide1', 'glide2',
    ],
  }),
  pelican: defineCreature<PelicanPoseName>({
    key: 'pelican', label: 'Pelicano',
    pw: PELICAN_PW, ph: PELICAN_PH, ppu: ANIMAL_PPU, worldW: PELICAN_W, worldH: PELICAN_H,
    centerY: 0.4, camDist: 2.15,
    getPack: getPelicanPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.0, isCycle: true, bobAmp: 0.018 },
      { id: 'c_gulp', label: '▶ Papo', frames: ['gulp0', 'gulp1', 'gulp2', 'gulp1'], fps: 3.4, isCycle: true },
      { id: 'c_flap', label: '▶ Voo', frames: ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'], fps: 8.5, isCycle: true, hopAmp: 0.12 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'gulp0', 'gulp1', 'gulp2',
      'flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5',
    ],
  }),
  penguin: defineCreature<PenguinPoseName>({
    key: 'penguin', label: 'Pinguim',
    pw: PENGUIN_PW, ph: PENGUIN_PH, ppu: ANIMAL_PPU, worldW: PENGUIN_W, worldH: PENGUIN_H,
    centerY: 0.34, camDist: 1.75,
    getPack: getPenguinPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_waddle', label: '▶ Andando', frames: ['waddle0', 'waddle1', 'waddle2', 'waddle3', 'waddle4', 'waddle5'], fps: 8.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_slide', label: '▶ Escorregar', frames: ['slide0', 'slide1', 'slide2', 'slide3'], fps: 8.0, isCycle: true, bobAmp: 0.01 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'waddle0', 'waddle1', 'waddle2', 'waddle3', 'waddle4', 'waddle5',
      'slide0', 'slide1', 'slide2', 'slide3',
    ],
  }),
  ostrich: defineCreature<OstrichPoseName>({
    key: 'ostrich', label: 'Avestruz',
    pw: OSTRICH_PW, ph: OSTRICH_PH, ppu: ANIMAL_PPU, worldW: OSTRICH_W, worldH: OSTRICH_H,
    centerY: 0.62, camDist: 2.95,
    getPack: getOstrichPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_sprint', label: '▶ Corrida', frames: ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'], fps: 12.0, isCycle: true, bobAmp: 0.035 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck1'], fps: 4.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5',
      'peck0', 'peck1', 'peck2',
    ],
  }),
  rhea: defineCreature<RheaPoseName>({
    key: 'rhea', label: 'Ema',
    pw: RHEA_PW, ph: RHEA_PH, ppu: ANIMAL_PPU, worldW: RHEA_W, worldH: RHEA_H,
    centerY: 0.54, camDist: 2.65,
    getPack: getRheaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_sprint', label: '▶ Corrida', frames: ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'], fps: 12.0, isCycle: true, bobAmp: 0.035 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck1'], fps: 4.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5',
      'peck0', 'peck1', 'peck2',
    ],
  }),
  emu: defineCreature<EmuPoseName>({
    key: 'emu', label: 'Emu',
    pw: EMU_PW, ph: EMU_PH, ppu: ANIMAL_PPU, worldW: EMU_W, worldH: EMU_H,
    centerY: 0.54, camDist: 2.65,
    getPack: getEmuPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_sprint', label: '▶ Corrida', frames: ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'], fps: 12.0, isCycle: true, bobAmp: 0.035 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck1'], fps: 4.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5',
      'peck0', 'peck1', 'peck2',
    ],
  }),
  alligator: defineCreature<AlligatorPoseName>({
    key: 'alligator', label: 'Jacaré',
    pw: ALLIGATOR_PW, ph: ALLIGATOR_PH, ppu: ANIMAL_PPU, worldW: ALLIGATOR_W, worldH: ALLIGATOR_H,
    centerY: 0.28, camDist: 2.5,
    getPack: getAlligatorPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_crawl', label: '▶ Rastejar', frames: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'], fps: 7.0, isCycle: true, bobAmp: 0.012 },
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3'], fps: 6.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_snap', label: '▶ Mordida', frames: ['snap0', 'snap1', 'snap2', 'snap1'], fps: 6.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5',
      'swim0', 'swim1', 'swim2', 'swim3',
      'snap0', 'snap1', 'snap2',
    ],
  }),
  crocodile: defineCreature<CrocodilePoseName>({
    key: 'crocodile', label: 'Crocodilo',
    pw: CROCODILE_PW, ph: CROCODILE_PH, ppu: ANIMAL_PPU, worldW: CROCODILE_W, worldH: CROCODILE_H,
    centerY: 0.28, camDist: 2.6,
    getPack: getCrocodilePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_crawl', label: '▶ Rastejar', frames: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'], fps: 7.5, isCycle: true, bobAmp: 0.012 },
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3'], fps: 6.5, isCycle: true, bobAmp: 0.015 },
      { id: 'c_snap', label: '▶ Mordida', frames: ['snap0', 'snap1', 'snap2', 'snap1'], fps: 6.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5',
      'swim0', 'swim1', 'swim2', 'swim3',
      'snap0', 'snap1', 'snap2',
    ],
  }),
  gharial: defineCreature<GharialPoseName>({
    key: 'gharial', label: 'Gavial',
    pw: GHARIAL_PW, ph: GHARIAL_PH, ppu: ANIMAL_PPU, worldW: GHARIAL_W, worldH: GHARIAL_H,
    centerY: 0.26, camDist: 2.55,
    getPack: getGharialPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_crawl', label: '▶ Rastejar', frames: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'], fps: 7.0, isCycle: true, bobAmp: 0.012 },
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3'], fps: 7.0, isCycle: true, bobAmp: 0.015 },
      { id: 'c_snap', label: '▶ Bote', frames: ['snap0', 'snap1', 'snap2', 'snap1'], fps: 7.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5',
      'swim0', 'swim1', 'swim2', 'swim3',
      'snap0', 'snap1', 'snap2',
    ],
  }),
  komodo_dragon: defineCreature<KomodoDragonPoseName>({
    key: 'komodo_dragon', label: 'Dragão-de-Komodo',
    pw: KOMODO_PW, ph: KOMODO_PH, ppu: ANIMAL_PPU, worldW: KOMODO_W, worldH: KOMODO_H,
    centerY: 0.3, camDist: 2.55,
    getPack: getKomodoDragonPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.0, isCycle: true, bobAmp: 0.015 },
      { id: 'c_hiss', label: '▶ Ameaça', frames: ['hiss0', 'hiss1', 'hiss2', 'hiss1'], fps: 4.5, isCycle: true },
      { id: 'c_lunge', label: '▶ Bote', frames: ['lunge0', 'lunge1', 'lunge2', 'lunge3'], fps: 8.5, isCycle: true, hopAmp: 0.12 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'hiss0', 'hiss1', 'hiss2',
      'lunge0', 'lunge1', 'lunge2', 'lunge3',
    ],
  }),
  axolotl: defineCreature<AxolotlPoseName>({
    key: 'axolotl', label: 'Axolote',
    pw: AXOLOTL_PW, ph: AXOLOTL_PH, ppu: ANIMAL_PPU, worldW: AXOLOTL_W, worldH: AXOLOTL_H,
    centerY: 0.18, camDist: 1.45,
    getPack: getAxolotlPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.0, isCycle: true, bobAmp: 0.01 },
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3'], fps: 7.5, isCycle: true, bobAmp: 0.02 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'swim0', 'swim1', 'swim2', 'swim3',
    ],
  }),
  green_lizard: defineCreature<GreenLizardPoseName>({
    key: 'green_lizard', label: 'Calango Verde',
    pw: GREEN_LIZARD_PW, ph: GREEN_LIZARD_PH, ppu: ANIMAL_PPU, worldW: GREEN_LIZARD_W, worldH: GREEN_LIZARD_H,
    centerY: 0.16, camDist: 1.45,
    getPack: getGreenLizardPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 3.2, isCycle: true },
      { id: 'c_dart', label: '▶ Corrida', frames: ['dart0', 'dart1', 'dart2', 'dart3', 'dart4', 'dart5'], fps: 12.0, isCycle: true, bobAmp: 0.01 },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'dart0', 'dart1', 'dart2', 'dart3', 'dart4', 'dart5',
    ],
  }),
  chameleon: defineCreature<ChameleonPoseName>({
    key: 'chameleon', label: 'Camaleão',
    pw: CHAMELEON_PW, ph: CHAMELEON_PH, ppu: ANIMAL_PPU, worldW: CHAMELEON_W, worldH: CHAMELEON_H,
    centerY: 0.24, camDist: 1.5,
    getPack: getChameleonPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 5.5, isCycle: true, bobAmp: 0.01 },
      { id: 'c_zap', label: '▶ Língua', frames: ['zap0', 'zap1', 'zap2', 'zap1'], fps: 7.5, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5',
      'zap0', 'zap1', 'zap2',
    ],
  }),
  swordfish: defineCreature<SwordfishPoseName>({
    key: 'swordfish', label: 'Peixe-Espada',
    pw: SWORDFISH_PW, ph: SWORDFISH_PH, ppu: ANIMAL_PPU, worldW: SWORDFISH_W, worldH: SWORDFISH_H,
    centerY: 0.3, camDist: 2.5,
    getPack: getSwordfishPosePack,
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 8.5, isCycle: true, bobAmp: 0.02 },
      { id: 'c_dart', label: '▶ Disparo', frames: ['dart0', 'dart1', 'dart2', 'dart3'], fps: 12.0, isCycle: true, bobAmp: 0.03 },
    ],
    poses: [
      'swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5',
      'dart0', 'dart1', 'dart2', 'dart3',
    ],
  }),
  stingray: defineCreature<StingrayPoseName>({
    key: 'stingray', label: 'Arraia',
    pw: STINGRAY_PW, ph: STINGRAY_PH, ppu: ANIMAL_PPU, worldW: STINGRAY_W, worldH: STINGRAY_H,
    centerY: 0.26, camDist: 2.35,
    getPack: getStingrayPosePack,
    anims: [
      { id: 'c_glide', label: '▶ Planando', frames: ['glide0', 'glide1', 'glide2', 'glide3', 'glide4', 'glide5'], fps: 7.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_rest', label: '▶ Repouso', frames: ['rest0', 'rest1', 'rest2', 'rest1'], fps: 2.0, isCycle: true },
    ],
    poses: [
      'glide0', 'glide1', 'glide2', 'glide3', 'glide4', 'glide5',
      'rest0', 'rest1', 'rest2',
    ],
  }),
  narwhal: defineCreature<NarwhalPoseName>({
    key: 'narwhal', label: 'Narval',
    pw: NARWHAL_PW, ph: NARWHAL_PH, ppu: ANIMAL_PPU, worldW: NARWHAL_W, worldH: NARWHAL_H,
    centerY: 0.32, camDist: 2.65,
    getPack: getNarwhalPosePack,
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 7.5, isCycle: true, bobAmp: 0.025 },
      { id: 'c_breach', label: '▶ Salto', frames: ['breach0', 'breach1', 'breach2', 'breach3'], fps: 6.5, isCycle: true, hopAmp: 0.22 },
    ],
    poses: [
      'swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5',
      'breach0', 'breach1', 'breach2', 'breach3',
    ],
  }),
  scorpion: defineCreature<ScorpionPoseName>({
    key: 'scorpion', label: 'Escorpião',
    pw: SCORPION_PW, ph: SCORPION_PH, ppu: ANIMAL_PPU, worldW: SCORPION_W, worldH: SCORPION_H,
    centerY: 0.22, camDist: 1.45,
    getPack: getScorpionPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_scuttle', label: '▶ Andando', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 9.0, isCycle: true, bobAmp: 0.01 },
      { id: 'c_sting', label: '▶ Ferroada', frames: ['sting0', 'sting1', 'sting2', 'sting1'], fps: 7.0, isCycle: true },
    ],
    poses: [
      'idle0', 'idle1', 'idle2',
      'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5',
      'sting0', 'sting1', 'sting2',
    ],
  }),
  black_widow: defineCreature<BlackWidowPoseName>({
    key: 'black_widow', label: 'Viúva-Negra',
    pw: BLACK_WIDOW_PW, ph: BLACK_WIDOW_PH, ppu: ANIMAL_PPU, worldW: BLACK_WIDOW_W, worldH: BLACK_WIDOW_H,
    centerY: 0.2, camDist: 1.4,
    getPack: getBlackWidowPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_scuttle', label: '▶ Andando', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 10.0, isCycle: true },
      { id: 'c_threat', label: '▶ Ameaça', frames: ['threat0', 'threat1', 'threat2', 'threat1'], fps: 5.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5', 'threat0', 'threat1', 'threat2'],
  }),
  tarantula: defineCreature<TarantulaPoseName>({
    key: 'tarantula', label: 'Tarântula',
    pw: TARANTULA_PW, ph: TARANTULA_PH, ppu: ANIMAL_PPU, worldW: TARANTULA_W, worldH: TARANTULA_H,
    centerY: 0.22, camDist: 1.55,
    getPack: getTarantulaPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_scuttle', label: '▶ Andando', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 8.5, isCycle: true },
      { id: 'c_threat', label: '▶ Ameaça', frames: ['threat0', 'threat1', 'threat2', 'threat1'], fps: 4.5, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5', 'threat0', 'threat1', 'threat2'],
  }),
  wandering_spider: defineCreature<WanderingSpiderPoseName>({
    key: 'wandering_spider', label: 'Armadeira',
    pw: WANDERING_SPIDER_PW, ph: WANDERING_SPIDER_PH, ppu: ANIMAL_PPU, worldW: WANDERING_SPIDER_W, worldH: WANDERING_SPIDER_H,
    centerY: 0.22, camDist: 1.55,
    getPack: getWanderingSpiderPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_scuttle', label: '▶ Andando', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 9.5, isCycle: true },
      { id: 'c_threat', label: '▶ Armadeira', frames: ['threat0', 'threat1', 'threat2', 'threat1'], fps: 5.5, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5', 'threat0', 'threat1', 'threat2'],
  }),
  trapdoor_spider: defineCreature<TrapdoorSpiderPoseName>({
    key: 'trapdoor_spider', label: 'Aranha-Alçapão',
    pw: TRAPDOOR_SPIDER_PW, ph: TRAPDOOR_SPIDER_PH, ppu: ANIMAL_PPU, worldW: TRAPDOOR_SPIDER_W, worldH: TRAPDOOR_SPIDER_H,
    centerY: 0.2, camDist: 1.45,
    getPack: getTrapdoorSpiderPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_scuttle', label: '▶ Andando', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 8.5, isCycle: true },
      { id: 'c_threat', label: '▶ Ameaça', frames: ['threat0', 'threat1', 'threat2', 'threat1'], fps: 5.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5', 'threat0', 'threat1', 'threat2'],
  }),
  goliath_spider: defineCreature<GoliathSpiderPoseName>({
    key: 'goliath_spider', label: 'Aranha-Golias',
    pw: GOLIATH_SPIDER_PW, ph: GOLIATH_SPIDER_PH, ppu: ANIMAL_PPU, worldW: GOLIATH_SPIDER_W, worldH: GOLIATH_SPIDER_H,
    centerY: 0.26, camDist: 1.85,
    getPack: getGoliathSpiderPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_scuttle', label: '▶ Andando', frames: ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'], fps: 7.5, isCycle: true },
      { id: 'c_threat', label: '▶ Ameaça', frames: ['threat0', 'threat1', 'threat2', 'threat1'], fps: 4.5, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5', 'threat0', 'threat1', 'threat2'],
  }),
  dung_beetle: defineCreature<DungBeetlePoseName>({
    key: 'dung_beetle', label: 'Rola-Bosta',
    pw: DUNG_BEETLE_PW, ph: DUNG_BEETLE_PH, ppu: ANIMAL_PPU, worldW: DUNG_BEETLE_W, worldH: DUNG_BEETLE_H,
    centerY: 0.2, camDist: 1.45,
    getPack: getDungBeetlePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_roll', label: '▶ Rolando', frames: ['roll0', 'roll1', 'roll2', 'roll3', 'roll4', 'roll5'], fps: 8.5, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'roll0', 'roll1', 'roll2', 'roll3', 'roll4', 'roll5'],
  }),
  hercules_beetle: defineCreature<HerculesBeetlePoseName>({
    key: 'hercules_beetle', label: 'Besouro-Hércules',
    pw: HERCULES_BEETLE_PW, ph: HERCULES_BEETLE_PH, ppu: ANIMAL_PPU, worldW: HERCULES_BEETLE_W, worldH: HERCULES_BEETLE_H,
    centerY: 0.22, camDist: 1.65,
    getPack: getHerculesBeetlePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
  }),
  praying_mantis: defineCreature<PrayingMantisPoseName>({
    key: 'praying_mantis', label: 'Louva-Deus',
    pw: PRAYING_MANTIS_PW, ph: PRAYING_MANTIS_PH, ppu: ANIMAL_PPU, worldW: PRAYING_MANTIS_W, worldH: PRAYING_MANTIS_H,
    centerY: 0.28, camDist: 1.6,
    getPack: getPrayingMantisPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 7.0, isCycle: true },
      { id: 'c_strike', label: '▶ Golpe', frames: ['strike0', 'strike1', 'strike2', 'strike1'], fps: 8.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'strike0', 'strike1', 'strike2'],
  }),
  wasp: defineCreature<WaspPoseName>({
    key: 'wasp', label: 'Vespa',
    pw: WASP_PW, ph: WASP_PH, ppu: ANIMAL_PPU, worldW: WASP_W, worldH: WASP_H,
    centerY: 0.22, camDist: 1.25,
    getPack: getWaspPosePack,
    anims: [
      { id: 'c_buzz', label: '▶ Zumbindo', frames: ['buzz0', 'buzz1', 'buzz2', 'buzz3'], fps: 14.0, isCycle: true, bobAmp: 0.04 },
    ],
    poses: ['buzz0', 'buzz1', 'buzz2', 'buzz3'],
  }),
  tarantula_hawk: defineCreature<TarantulaHawkPoseName>({
    key: 'tarantula_hawk', label: 'Vespa-do-Cão',
    pw: TARANTULA_HAWK_PW, ph: TARANTULA_HAWK_PH, ppu: ANIMAL_PPU, worldW: TARANTULA_HAWK_W, worldH: TARANTULA_HAWK_H,
    centerY: 0.24, camDist: 1.4,
    getPack: getTarantulaHawkPosePack,
    anims: [
      { id: 'c_buzz', label: '▶ Pairando', frames: ['buzz0', 'buzz1', 'buzz2', 'buzz3'], fps: 13.0, isCycle: true, bobAmp: 0.04 },
      { id: 'c_dart', label: '▶ Disparo', frames: ['dart0', 'dart1', 'dart2', 'dart3'], fps: 14.0, isCycle: true, bobAmp: 0.03 },
    ],
    poses: ['buzz0', 'buzz1', 'buzz2', 'buzz3', 'dart0', 'dart1', 'dart2', 'dart3'],
  }),
  earthworm: defineCreature<EarthwormPoseName>({
    key: 'earthworm', label: 'Minhoca',
    pw: EARTHWORM_PW, ph: EARTHWORM_PH, ppu: ANIMAL_PPU, worldW: EARTHWORM_W, worldH: EARTHWORM_H,
    centerY: 0.12, camDist: 1.25,
    getPack: getEarthwormPosePack,
    anims: [
      { id: 'c_crawl', label: '▶ Rastejar', frames: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'], fps: 6.5, isCycle: true },
    ],
    poses: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'],
  }),
  ant: defineCreature<AntPoseName>({
    key: 'ant', label: 'Formiga',
    pw: ANT_PW, ph: ANT_PH, ppu: ANIMAL_PPU, worldW: ANT_W, worldH: ANT_H,
    centerY: 0.14, camDist: 1.15,
    getPack: getAntPosePack,
    anims: [
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 10.0, isCycle: true },
    ],
    poses: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
  }),
  caterpillar: defineCreature<CaterpillarPoseName>({
    key: 'caterpillar', label: 'Lagarta',
    pw: CATERPILLAR_PW, ph: CATERPILLAR_PH, ppu: ANIMAL_PPU, worldW: CATERPILLAR_W, worldH: CATERPILLAR_H,
    centerY: 0.14, camDist: 1.25,
    getPack: getCaterpillarPosePack,
    anims: [
      { id: 'c_crawl', label: '▶ Rastejar', frames: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'], fps: 6.5, isCycle: true },
    ],
    poses: ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'],
  }),
  moth: defineCreature<MothPoseName>({
    key: 'moth', label: 'Mariposa',
    pw: MOTH_PW, ph: MOTH_PH, ppu: ANIMAL_PPU, worldW: MOTH_W, worldH: MOTH_H,
    centerY: 0.24, camDist: 1.35,
    getPack: getMothPosePack,
    anims: [
      { id: 'c_flutter', label: '▶ Voando', frames: ['flutter0', 'flutter1', 'flutter2', 'flutter3', 'flutter4', 'flutter5'], fps: 10.0, isCycle: true, bobAmp: 0.05 },
    ],
    poses: ['flutter0', 'flutter1', 'flutter2', 'flutter3', 'flutter4', 'flutter5'],
  }),
  firefly: defineCreature<FireflyPoseName>({
    key: 'firefly', label: 'Vagalume',
    pw: FIREFLY_PW, ph: FIREFLY_PH, ppu: ANIMAL_PPU, worldW: FIREFLY_W, worldH: FIREFLY_H,
    centerY: 0.2, camDist: 1.15,
    getPack: getFireflyPosePack,
    anims: [
      { id: 'c_glow', label: '▶ Brilho', frames: ['glow0', 'glow1', 'glow2', 'glow3'], fps: 8.0, isCycle: true, bobAmp: 0.05 },
    ],
    poses: ['glow0', 'glow1', 'glow2', 'glow3'],
  }),
  ladybug: defineCreature<LadybugPoseName>({
    key: 'ladybug', label: 'Joaninha',
    pw: LADYBUG_PW, ph: LADYBUG_PH, ppu: ANIMAL_PPU, worldW: LADYBUG_W, worldH: LADYBUG_H,
    centerY: 0.14, camDist: 1.1,
    getPack: getLadybugPosePack,
    anims: [
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true },
    ],
    poses: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
  }),
  grasshopper: defineCreature<GrasshopperPoseName>({
    key: 'grasshopper', label: 'Gafanhoto',
    pw: GRASSHOPPER_PW, ph: GRASSHOPPER_PH, ppu: ANIMAL_PPU, worldW: GRASSHOPPER_W, worldH: GRASSHOPPER_H,
    centerY: 0.2, camDist: 1.4,
    getPack: getGrasshopperPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_hop', label: '▶ Pulo', frames: ['hop0', 'hop1', 'hop2', 'hop3'], fps: 9.0, isCycle: true, hopAmp: 0.22 },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'hop0', 'hop1', 'hop2', 'hop3'],
  }),
  fly: defineCreature<FlyPoseName>({
    key: 'fly', label: 'Mosca',
    pw: FLY_PW, ph: FLY_PH, ppu: ANIMAL_PPU, worldW: FLY_W, worldH: FLY_H,
    centerY: 0.2, camDist: 1.1,
    getPack: getFlyPosePack,
    anims: [
      { id: 'c_buzz', label: '▶ Zumbindo', frames: ['buzz0', 'buzz1', 'buzz2', 'buzz3'], fps: 14.0, isCycle: true, bobAmp: 0.04 },
    ],
    poses: ['buzz0', 'buzz1', 'buzz2', 'buzz3'],
  }),
  raccoon: defineCreature<RaccoonPoseName>({
    key: 'raccoon', label: 'Guaxinim',
    pw: RACCOON_PW, ph: RACCOON_PH, ppu: ANIMAL_PPU, worldW: RACCOON_W, worldH: RACCOON_H,
    centerY: 0.28, camDist: 1.75,
    getPack: getRaccoonPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true, bobAmp: 0.018 },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
  }),
  giraffe: defineCreature<GiraffePoseName>({
    key: 'giraffe', label: 'Girafa',
    pw: GIRAFFE_PW, ph: GIRAFFE_PH, ppu: ANIMAL_PPU, worldW: GIRAFFE_W, worldH: GIRAFFE_H,
    centerY: 0.95, camDist: 4.1,
    getPack: getGiraffePosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 1.8, isCycle: true },
      { id: 'c_walk', label: '▶ Caminhada', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 6.0, isCycle: true, bobAmp: 0.02 },
      { id: 'c_graze', label: '▶ Pastando', frames: ['graze0', 'graze1', 'graze2', 'graze1'], fps: 2.6, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'graze0', 'graze1', 'graze2'],
  }),
  zebra: defineCreature<ZebraPoseName>({
    key: 'zebra', label: 'Zebra',
    pw: ZEBRA_PW, ph: ZEBRA_PH, ppu: ANIMAL_PPU, worldW: ZEBRA_W, worldH: ZEBRA_H,
    centerY: 0.62, camDist: 3.1,
    getPack: getZebraPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.0, isCycle: true },
      { id: 'c_trot', label: '▶ Trote', frames: ['trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5'], fps: 8.5, isCycle: true, bobAmp: 0.03 },
      { id: 'c_gallop', label: '▶ Galope', frames: ['gallop0', 'gallop1', 'gallop2', 'gallop3', 'gallop4', 'gallop5'], fps: 12.0, isCycle: true, bobAmp: 0.04 },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5', 'gallop0', 'gallop1', 'gallop2', 'gallop3', 'gallop4', 'gallop5'],
  }),
  armadillo: defineCreature<ArmadilloPoseName>({
    key: 'armadillo', label: 'Tatu',
    pw: ARMADILLO_PW, ph: ARMADILLO_PH, ppu: ANIMAL_PPU, worldW: ARMADILLO_W, worldH: ARMADILLO_H,
    centerY: 0.22, camDist: 1.6,
    getPack: getArmadilloPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
  }),
  three_banded_armadillo: defineCreature<ThreeBandedArmadilloPoseName>({
    key: 'three_banded_armadillo', label: 'Tatu-Bolinha',
    pw: THREE_BANDED_ARMADILLO_PW, ph: THREE_BANDED_ARMADILLO_PH, ppu: ANIMAL_PPU, worldW: THREE_BANDED_ARMADILLO_W, worldH: THREE_BANDED_ARMADILLO_H,
    centerY: 0.22, camDist: 1.5,
    getPack: getThreeBandedArmadilloPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true },
      { id: 'c_curl', label: '▶ Bola', frames: ['curl0', 'curl1', 'curl2', 'curl1'], fps: 3.5, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'curl0', 'curl1', 'curl2'],
  }),
  kiwi: defineCreature<KiwiPoseName>({
    key: 'kiwi', label: 'Kiwi',
    pw: KIWI_PW, ph: KIWI_PH, ppu: ANIMAL_PPU, worldW: KIWI_W, worldH: KIWI_H,
    centerY: 0.24, camDist: 1.4,
    getPack: getKiwiPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.2, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.0, isCycle: true, bobAmp: 0.015 },
      { id: 'c_peck', label: '▶ Bicando', frames: ['peck0', 'peck1', 'peck2', 'peck1'], fps: 5.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'peck0', 'peck1', 'peck2'],
  }),
  vampire_squid: defineCreature<VampireSquidPoseName>({
    key: 'vampire_squid', label: 'Lula-Vampira',
    pw: VAMPIRE_SQUID_PW, ph: VAMPIRE_SQUID_PH, ppu: ANIMAL_PPU, worldW: VAMPIRE_SQUID_W, worldH: VAMPIRE_SQUID_H,
    centerY: 0.34, camDist: 1.9,
    getPack: getVampireSquidPosePack,
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 7.0, isCycle: true, bobAmp: 0.025 },
    ],
    poses: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'],
  }),
  jellyfish: defineCreature<JellyfishPoseName>({
    key: 'jellyfish', label: 'Água-Viva',
    pw: JELLYFISH_PW, ph: JELLYFISH_PH, ppu: ANIMAL_PPU, worldW: JELLYFISH_W, worldH: JELLYFISH_H,
    centerY: 0.42, camDist: 2.0,
    getPack: getJellyfishPosePack,
    anims: [
      { id: 'c_pulse', label: '▶ Pulso', frames: ['pulse0', 'pulse1', 'pulse2', 'pulse3', 'pulse4', 'pulse5'], fps: 6.5, isCycle: true, bobAmp: 0.04 },
    ],
    poses: ['pulse0', 'pulse1', 'pulse2', 'pulse3', 'pulse4', 'pulse5'],
  }),
  dumbo_octopus: defineCreature<DumboOctopusPoseName>({
    key: 'dumbo_octopus', label: 'Polvo-Elefante',
    pw: DUMBO_OCTOPUS_PW, ph: DUMBO_OCTOPUS_PH, ppu: ANIMAL_PPU, worldW: DUMBO_OCTOPUS_W, worldH: DUMBO_OCTOPUS_H,
    centerY: 0.3, camDist: 1.65,
    getPack: getDumboOctopusPosePack,
    anims: [
      { id: 'c_swim', label: '▶ Nado', frames: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'], fps: 7.5, isCycle: true, bobAmp: 0.03 },
    ],
    poses: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'],
  }),
  mantis_shrimp: defineCreature<MantisShrimpPoseName>({
    key: 'mantis_shrimp', label: 'Camarão-Boxeador',
    pw: MANTIS_SHRIMP_PW, ph: MANTIS_SHRIMP_PH, ppu: ANIMAL_PPU, worldW: MANTIS_SHRIMP_W, worldH: MANTIS_SHRIMP_H,
    centerY: 0.24, camDist: 1.7,
    getPack: getMantisShrimpPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true },
      { id: 'c_punch', label: '▶ Soco', frames: ['punch0', 'punch1', 'punch2', 'punch1'], fps: 9.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'punch0', 'punch1', 'punch2'],
  }),
  pistol_shrimp: defineCreature<PistolShrimpPoseName>({
    key: 'pistol_shrimp', label: 'Lagosta-Pistola',
    pw: PISTOL_SHRIMP_PW, ph: PISTOL_SHRIMP_PH, ppu: ANIMAL_PPU, worldW: PISTOL_SHRIMP_W, worldH: PISTOL_SHRIMP_H,
    centerY: 0.24, camDist: 1.65,
    getPack: getPistolShrimpPosePack,
    anims: [
      { id: 'c_idle', label: '▶ Idle', frames: ['idle0', 'idle1', 'idle0', 'idle2'], fps: 2.4, isCycle: true },
      { id: 'c_walk', label: '▶ Andando', frames: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'], fps: 8.5, isCycle: true },
      { id: 'c_snap', label: '▶ Estalo', frames: ['snap0', 'snap1', 'snap2', 'snap1'], fps: 9.0, isCycle: true },
    ],
    poses: ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'snap0', 'snap1', 'snap2'],
  }),
};

function texToDataUrl(tex: THREE.CanvasTexture): string {
  const img = tex.image as { toDataURL?: (t: string) => string; data?: Uint8Array; width?: number; height?: number } | undefined;
  if (!img) return '';
  if (typeof img.toDataURL === 'function') return img.toDataURL('image/png');
  if (img.data && img.width && img.height) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d');
    if (g) {
      const id = g.createImageData(img.width, img.height);
      const rowBytes = img.width * 4;
      for (let y = 0; y < img.height; y++) {
        const srcOff = (tex.flipY ? y : img.height - 1 - y) * rowBytes;
        id.data.set(img.data.subarray(srcOff, srcOff + rowBytes), y * rowBytes);
      }
      g.putImageData(id, 0, 0);
      return c.toDataURL('image/png');
    }
  }
  return '';
}

function buildHeroCatalog(bb: SkeletalBillboard): SpriteEntry[] {
  const s = bb.sprites;
  const list: SpriteEntry[] = [];
  const add = (e: Omit<SpriteEntry, 'id' | 'dataUrl'>, tex: THREE.CanvasTexture) => {
    list.push({ ...e, id: `hero_${e.codeName}`, dataUrl: texToDataUrl(tex) });
  };

  const addHeadTier = (tier: EightWayTier, tierCode: string, tierLabel: string, pitchDeg: number, pitchCond: string) => {
    const dirs: { key: keyof EightWayTier; code: string; label: string; yawDeg: number; yawCond: string; mirror?: string }[] = [
      { key: 'front', code: 'FRONT', label: 'Frente', yawDeg: 0, yawCond: 'absAngle < 22,5°' },
      { key: 'frontSide', code: 'FRONT_SIDE', label: '3/4 Frente', yawDeg: 45, yawCond: '22,5° ≤ absAngle < 67,5°', mirror: 'Espelha (flipX) para o outro lado' },
      { key: 'side', code: 'SIDE', label: 'Lado', yawDeg: 90, yawCond: '67,5° ≤ absAngle < 112,5°', mirror: 'Espelha (flipX) para o outro lado' },
      { key: 'backSide', code: 'BACK_SIDE', label: '3/4 Costas', yawDeg: 135, yawCond: '112,5° ≤ absAngle < 157,5°', mirror: 'Espelha (flipX) para o outro lado' },
      { key: 'back', code: 'BACK', label: 'Costas', yawDeg: 180, yawCond: 'absAngle ≥ 157,5°' },
    ];
    for (const d of dirs) {
      add({
        codeName: `HEAD_${tierCode ? tierCode + '_' : ''}${d.code}`,
        part: 'head', partLabel: 'Cabeça', jointLabel: 'joint: head',
        angleLabel: `${tierLabel} · ${d.label}`,
        pitchLabel: `${pitchDeg >= 0 ? '+' : ''}${pitchDeg}°`, yawLabel: `${d.yawDeg}°`,
        condition: `${pitchCond} · ${d.yawCond}`, mirrorNote: d.mirror,
        camYawDeg: d.yawDeg, camPitchDeg: pitchDeg, targetY: 1.46, camDist: 2.35,
        w: s.head.meta.pixelWidth, h: s.head.meta.pixelHeight,
      }, tier[d.key]);
    }
  };

  add({
    codeName: 'HEAD_TOP', part: 'head', partLabel: 'Cabeça', jointLabel: 'joint: head',
    angleLabel: 'Topo (Vista aérea)', pitchLabel: '+80°', yawLabel: '0°',
    condition: 'bodyUpDot > 0.94', camYawDeg: 0, camPitchDeg: 80, targetY: 1.46, camDist: 2.45,
    w: s.head.meta.pixelWidth, h: s.head.meta.pixelHeight,
  }, s.head.textures.top);

  addHeadTier(s.head.textures.high, 'HIGH', 'Alto (+48°)', 48, 'Inclinação da cabeça ≥ +36°');
  addHeadTier(s.head.textures.midHigh, 'MID_HIGH', 'Médio-Alto (+24°)', 24, 'Inclinação entre +12° e +36°');
  addHeadTier(s.head.textures, '', 'Nível (0°)', 0, 'Inclinação entre −12° e +12°');
  addHeadTier(s.head.textures.midLow, 'MID_LOW', 'Médio-Baixo (-24°)', -24, 'Inclinação entre −36° e −12°');
  addHeadTier(s.head.textures.low, 'LOW', 'Baixo (-48°)', -48, 'Inclinação entre −68° e −36°');

  add({
    codeName: 'HEAD_BOTTOM', part: 'head', partLabel: 'Cabeça', jointLabel: 'joint: head',
    angleLabel: 'Por baixo (Queixo)', pitchLabel: '-88°', yawLabel: '0°',
    condition: 'Inclinação da cabeça abaixo de −68°', camYawDeg: 0, camPitchDeg: -60, targetY: 1.46, camDist: 2.45,
    w: s.head.meta.pixelWidth, h: s.head.meta.pixelHeight,
  }, s.head.textures.bottom);

  const addCore = (
    part: 'torso' | 'pelvis' | 'shin',
    prefix: string, partLabel: string, jointLabel: string, targetY: number,
    tex: typeof s.torso.textures, meta: typeof s.torso.meta,
  ) => {
    const items: { key: keyof typeof s.torso.textures; code: string; angle: string; pitchDeg: number; yawDeg: number; cond: string; mirror?: string }[] = [
      { key: 'front', code: 'FRONT', angle: 'Nível · Frente', pitchDeg: 0, yawDeg: 0, cond: 'bodyUpDot ≤ 0.56 · absAngle < 27°' },
      { key: 'frontSide', code: 'FRONT_SIDE', angle: 'Nível · 3/4 Frente', pitchDeg: 0, yawDeg: 45, cond: 'bodyUpDot ≤ 0.56 · 27° ≤ absAngle < 68°', mirror: 'Espelha (flipX)' },
      { key: 'side', code: 'SIDE', angle: 'Nível · Lado', pitchDeg: 0, yawDeg: 90, cond: 'bodyUpDot ≤ 0.56 · 68° ≤ absAngle < 112°', mirror: 'Espelha (flipX)' },
      { key: 'backSide', code: 'BACK_SIDE', angle: 'Nível · 3/4 Costas', pitchDeg: 0, yawDeg: 135, cond: 'bodyUpDot ≤ 0.56 · 112° ≤ absAngle < 153°', mirror: 'Espelha (flipX)' },
      { key: 'back', code: 'BACK', angle: 'Nível · Costas', pitchDeg: 0, yawDeg: 180, cond: 'bodyUpDot ≤ 0.56 · absAngle ≥ 153°' },
      { key: 'highFront', code: 'HIGH_FRONT', angle: 'Alto (+48°) · Frente', pitchDeg: 48, yawDeg: 0, cond: 'bodyUpDot ∈ (0.56, 0.94] · absAngle < 45°' },
      { key: 'highSide', code: 'HIGH_SIDE', angle: 'Alto (+48°) · Lado', pitchDeg: 48, yawDeg: 90, cond: 'bodyUpDot ∈ (0.56, 0.94] · 45° ≤ absAngle < 135°', mirror: 'Espelha (flipX)' },
      { key: 'highBack', code: 'HIGH_BACK', angle: 'Alto (+48°) · Costas', pitchDeg: 48, yawDeg: 180, cond: 'bodyUpDot ∈ (0.56, 0.94] · absAngle ≥ 135°' },
      { key: 'top', code: 'TOP', angle: 'Topo (+80°)', pitchDeg: 80, yawDeg: 0, cond: 'bodyUpDot > 0.94' },
    ];
    for (const it of items) {
      add({
        codeName: `${prefix}_${it.code}`, part, partLabel, jointLabel,
        angleLabel: it.angle, pitchLabel: `${it.pitchDeg >= 0 ? '+' : ''}${it.pitchDeg}°`, yawLabel: `${it.yawDeg}°`,
        condition: it.cond, mirrorNote: it.mirror,
        camYawDeg: it.yawDeg, camPitchDeg: it.pitchDeg, targetY, camDist: 2.55,
        w: meta.pixelWidth, h: meta.pixelHeight,
      }, tex[it.key]);
    }
  };

  addCore('torso', 'TORSO', 'Torso', 'joint: chest', 1.12, s.torso.textures, s.torso.meta);
  addCore('pelvis', 'PELVIS', 'Pélvis / Quadril', 'joint: pelvis', 0.86, s.pelvis.textures, s.pelvis.meta);
  addCore('shin', 'SHIN', 'Canela + Bota', 'joints: shinR / shinL → foot', 0.36, s.shin.textures, s.shin.meta);

  const limbs: { part: HeroBodyPartKey; code: string; label: string; joint: string; targetY: number; yawDeg: number; tex: THREE.CanvasTexture; w: number; h: number }[] = [
    { part: 'upperArm', code: 'UPPER_ARM', label: 'Braço Superior', joint: 'joints: upperArmR / upperArmL', targetY: 1.18, yawDeg: 35, tex: s.upperArm.textures, w: s.upperArm.meta.pixelWidth, h: s.upperArm.meta.pixelHeight },
    { part: 'forearm', code: 'FOREARM', label: 'Antebraço', joint: 'joints: forearmR / forearmL', targetY: 0.96, yawDeg: 35, tex: s.forearm.textures, w: s.forearm.meta.pixelWidth, h: s.forearm.meta.pixelHeight },
    { part: 'hand', code: 'HAND', label: 'Mão', joint: 'joints: handR / handL', targetY: 0.80, yawDeg: 30, tex: s.hand.textures, w: s.hand.meta.pixelWidth, h: s.hand.meta.pixelHeight },
    { part: 'thigh', code: 'THIGH', label: 'Coxa', joint: 'joints: thighR / thighL', targetY: 0.65, yawDeg: 35, tex: s.thigh.textures, w: s.thigh.meta.pixelWidth, h: s.thigh.meta.pixelHeight },
  ];
  for (const l of limbs) {
    add({
      codeName: l.code, part: l.part, partLabel: l.label, jointLabel: l.joint,
      angleLabel: 'Todos os ângulos (rotaciona 2D no osso)', pitchLabel: 'Qualquer', yawLabel: 'Qualquer',
      condition: 'Billboard axial alinhado ao osso',
      mirrorNote: 'Espelhado conforme o lado',
      camYawDeg: l.yawDeg, camPitchDeg: 6, targetY: l.targetY, camDist: 2.55, w: l.w, h: l.h,
    }, l.tex);
  }
  return list;
}

function buildCreatureCatalog(cfg: CreatureConfig, poseKey: string): SpriteEntry[] {
  const pack = (cfg.getSheetPack ?? cfg.getPack)(poseKey);
  const list: SpriteEntry[] = [];
  const prefix = `${cfg.key.toUpperCase()}_${poseKey.toUpperCase()}`;

  const add = (code: string, angleLabel: string, pitchDeg: number, yawDeg: number, cond: string, tex: THREE.CanvasTexture, mirror?: string) => {
    list.push({
      id: `${cfg.key}_${poseKey}_${code}`,
      codeName: `${prefix}_${code}`,
      part: 'creature',
      partLabel: `${cfg.label} · ${poseKey}`,
      jointLabel: `Alvo no jogo ${ACTOR_PIXELS_PER_METER} px/m`,
      angleLabel,
      pitchLabel: `${pitchDeg >= 0 ? '+' : ''}${pitchDeg}°`,
      yawLabel: `${yawDeg}°`,
      condition: cond,
      mirrorNote: mirror,
      camYawDeg: yawDeg,
      camPitchDeg: pitchDeg,
      targetY: cfg.centerY,
      camDist: cfg.camDist,
      w: tex.image.width,
      h: tex.image.height,
      dataUrl: texToDataUrl(tex),
    });
  };

  if (!pack.asymmetric) add('TOP', 'Topo (+88°)', 88, 0, 'Vista polar', pack.getTop());

  const tiers: { idx: number; code: string; label: string; cond: string }[] = [
    { idx: 0, code: 'P80',   label: 'Bem alto (+80°)',   cond: 'pitch ≈ +80° (9 alturas · passo 20°)' },
    { idx: 1, code: 'P60',   label: 'Alto (+60°)',       cond: 'pitch ≈ +60° (9 alturas · passo 20°)' },
    { idx: 2, code: 'P40',   label: 'Médio-Alto (+40°)', cond: 'pitch ≈ +40° (9 alturas · passo 20°)' },
    { idx: 3, code: 'P20',   label: 'Leve Alto (+20°)',  cond: 'pitch ≈ +20° (9 alturas · passo 20°)' },
    { idx: 4, code: 'LEVEL', label: 'Nível (0°)',        cond: 'pitch ≈ 0° (9 alturas · passo 20°)' },
    { idx: 5, code: 'M20',   label: 'Leve Baixo (-20°)', cond: 'pitch ≈ -20° (9 alturas · passo 20°)' },
    { idx: 6, code: 'M40',   label: 'Médio-Baixo (-40°)',cond: 'pitch ≈ -40° (9 alturas · passo 20°)' },
    { idx: 7, code: 'M60',   label: 'Baixo (-60°)',      cond: 'pitch ≈ -60° (9 alturas · passo 20°)' },
    { idx: 8, code: 'M80',   label: 'Bem baixo (-80°)',  cond: 'pitch ≈ -80° (9 alturas · passo 20°)' },
  ];

  const sheetDirs = Array.from({ length: pack.asymmetric ? 16 : 9 }, (_, index) => index);
  for (const t of pack.asymmetric ? [tiers[4]] : tiers) {
    const pitch = CREATURE_PITCHES[t.idx];
    for (let i = 0; i < sheetDirs.length; i++) {
      const d = sheetDirs[i];
      const yaw = d < CREATURE_YAWS.length ? CREATURE_YAWS[d] : (d - 16) * 22.5;
      const mirror = !pack.asymmetric && d > 0 && d < 8 ? 'Espelha (flipX) para o outro lado' : undefined;
      add(
        `${t.code}_D${i}`,
        `${t.label} · ${yaw}°`,
        pitch,
        yaw,
        `${t.cond} · 16 direções (passo 22.5°)`,
        pack.getView(t.idx, d)!,
        mirror,
      );
    }
  }

  if (!pack.asymmetric) add('BOTTOM', 'Por baixo (-88°)', -88, 0, 'Vista polar', pack.getBottom());
  return list;
}

/**
 * Painel interativo "Mapa de Sprites × Parte / Ser × Ângulo × Animação".
 * Suporta o Herói (58 sprites + destaque por parte) e todos os animais
 * (Javali, Peixe, Coelho, Galinha) com seletor de animações e poses ao vivo em 3D.
 */
export class SpriteInspector {
  readonly root: HTMLDivElement;
  onClose?: () => void;

  private open = false;
  private entity: EntityKey = 'hero';
  private heroFilter: HeroFilterKey = 'all';
  private heroAnim: HeroAnimKey = 'idle';
  private creatureAnimId = 'c_idle';
  private creaturePose = 'idle0';

  private heroEntries: SpriteEntry[] = [];
  private activeEntries: SpriteEntry[] = [];
  private cardEls = new Map<string, HTMLButtonElement>();
  private hovered: SpriteEntry | null = null;
  private locked: SpriteEntry | null = null;
  private highlightEnabled = true;
  private freezePlanes = false;

  // UI refs
  private entityBarEl!: HTMLDivElement;
  private animBarEl!: HTMLDivElement;
  private filterBarEl!: HTMLDivElement;
  private listEl!: HTMLDivElement;
  private stageEl!: HTMLDivElement;
  private infoThumbEl!: HTMLImageElement;
  private infoNameEl!: HTMLElement;
  private infoPartEl!: HTMLElement;
  private infoAngleEl!: HTMLElement;
  private infoCondEl!: HTMLElement;
  private hudPartEl!: HTMLElement;
  private hudAngleEl!: HTMLElement;
  private hudLockEl!: HTMLElement;
  private hlWrapEl!: HTMLElement;

  // Isolated 3D preview scene
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private rig!: HumanoidRig;
  private billboard!: SkeletalBillboard;

  // Preview mesh for non-hero creatures (uses the exact same pixel-snap shader!)
  private creatureMesh!: THREE.Mesh;
  private creatureMat!: THREE.ShaderMaterial;
  private creatureMapU!: { value: THREE.CanvasTexture };
  private creatureTexelU!: { value: THREE.Vector2 };
  private creaturePixelSizeU = { value: 3.0 };
  private creatureGridOriginU = { value: new THREE.Vector2(0, 0) };
  private bufSize = new THREE.Vector2();
  private rafId = 0;

  // Scratch vectors for creature billboard orientation
  private readonly camPos = new THREE.Vector3();
  private readonly camUp = new THREE.Vector3();
  private readonly camBack = new THREE.Vector3();
  private readonly camFwd = new THREE.Vector3();
  private readonly toCam = new THREE.Vector3();
  private readonly xAxis = new THREE.Vector3();
  private readonly yAxis = new THREE.Vector3();
  private readonly zAxis = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly ndc = new THREE.Vector3();
  private readonly basisMat = new THREE.Matrix4();

  // Smooth camera orbit state
  private curYaw = 0;
  private curPitch = 0;
  private curTargetY = 1.05;
  private curDist = 2.55;
  private goalYaw = 0;
  private goalPitch = 0;
  private goalTargetY = 1.05;
  private goalDist = 2.55;
  private dragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private clockT = 0;
  private lastFrameMs = 0;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'sprite-inspector hidden';
    this.root.innerHTML = `
      <div class="si-shell">
        <aside class="si-sidebar">
          <div class="si-header">
            <div>
              <h2>Mapa de Sprites & Animações</h2>
              <p class="si-sub">Passe o mouse ou clique em um sprite para ver no 3D</p>
            </div>
            <button class="si-close" title="Fechar (M ou Esc)">×</button>
          </div>
          <div class="si-entities"></div>
          <div class="si-anims"></div>
          <div class="si-filters"></div>
          <div class="si-list"></div>
        </aside>
        <section class="si-preview">
          <div class="si-stage">
            <div class="si-hud-top">
              <div class="si-badge si-badge-part">Ser: <strong>—</strong></div>
              <div class="si-badge si-badge-angle">Ângulo: <strong>0° / 0°</strong></div>
              <div class="si-badge si-badge-lock hidden">Fixado</div>
            </div>
            <div class="si-hud-actions">
              <label class="si-toggle"><input type="checkbox" class="si-freeze-chk" /> Travar planos (ver de lado)</label>
              <label class="si-toggle si-hl-wrap"><input type="checkbox" class="si-hl-chk" checked /> Destacar parte</label>
              <button class="si-btn-reset" type="button">Resetar ângulo</button>
            </div>
            <div class="si-drag-hint">Arraste no 3D para girar · Roda do mouse para zoom</div>
          </div>
          <div class="si-info">
            <div class="si-info-thumb-wrap">
              <img class="si-info-thumb" alt="Sprite selecionado" />
            </div>
            <div class="si-info-meta">
              <div class="si-info-row">
                <code class="si-info-name">—</code>
                <span class="si-info-part">—</span>
              </div>
              <div class="si-info-angle">—</div>
              <div class="si-info-cond">—</div>
            </div>
          </div>
        </section>
      </div>
    `;
    document.body.appendChild(this.root);

    this.entityBarEl = this.root.querySelector('.si-entities')!;
    this.animBarEl = this.root.querySelector('.si-anims')!;
    this.filterBarEl = this.root.querySelector('.si-filters')!;
    this.listEl = this.root.querySelector('.si-list')!;
    this.stageEl = this.root.querySelector('.si-stage')!;
    this.infoThumbEl = this.root.querySelector('.si-info-thumb')!;
    this.infoNameEl = this.root.querySelector('.si-info-name')!;
    this.infoPartEl = this.root.querySelector('.si-info-part')!;
    this.infoAngleEl = this.root.querySelector('.si-info-angle')!;
    this.infoCondEl = this.root.querySelector('.si-info-cond')!;
    this.hudPartEl = this.root.querySelector('.si-badge-part strong')!;
    this.hudAngleEl = this.root.querySelector('.si-badge-angle strong')!;
    this.hudLockEl = this.root.querySelector('.si-badge-lock')!;
    this.hlWrapEl = this.root.querySelector('.si-hl-wrap')!;

    this.root.querySelector('.si-close')!.addEventListener('click', () => this.close());
    this.root.addEventListener('mousedown', (e) => {
      if (e.target === this.root) this.close();
    });

    const freezeChk = this.root.querySelector('.si-freeze-chk') as HTMLInputElement;
    freezeChk.addEventListener('change', () => {
      this.freezePlanes = freezeChk.checked;
    });

    const hlChk = this.root.querySelector('.si-hl-chk') as HTMLInputElement;
    hlChk.addEventListener('change', () => {
      this.highlightEnabled = hlChk.checked;
      if (!this.highlightEnabled) {
        this.billboard.setHighlightPart(null);
      }
    });

    this.root.querySelector('.si-btn-reset')!.addEventListener('click', () => {
      const active = this.locked ?? this.hovered ?? this.activeEntries[0];
      if (active) this.focusEntry(active, true);
    });

    window.addEventListener('keydown', (e) => {
      if (this.open && e.code === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });

    this.initPreviewScene();
    this.heroEntries = buildHeroCatalog(this.billboard);
    this.renderEntityTabs();
    this.selectEntity('hero');
    this.bindStageOrbit();
  }

  get isOpen() { return this.open; }
  toggle() { if (this.open) this.close(); else this.show(); }

  show() {
    if (this.open) return;
    this.open = true;
    this.root.classList.remove('hidden');
    this.resizePreview();
    this.lastFrameMs = performance.now();
    this.loop();
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.root.classList.add('hidden');
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.onClose?.();
  }

  private initPreviewScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x161c24);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xfff4dd, 1.1);
    dir.position.set(3, 6, 4);
    this.scene.add(dir);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 36),
      new THREE.MeshBasicMaterial({ color: 0x222b36, side: THREE.DoubleSide }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.08, 1.13, 48),
      new THREE.MeshBasicMaterial({ color: 0x3b4d63, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    this.scene.add(ring);

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 1.38);
    arrowShape.lineTo(-0.14, 1.14);
    arrowShape.lineTo(0.14, 1.14);
    arrowShape.closePath();
    const arrow = new THREE.Mesh(
      new THREE.ShapeGeometry(arrowShape),
      new THREE.MeshBasicMaterial({ color: 0x4ee6c8, side: THREE.DoubleSide }),
    );
    arrow.rotation.x = Math.PI / 2;
    arrow.position.y = 0.004;
    this.scene.add(arrow);

    // Herói real
    this.rig = new HumanoidRig(HERO_STYLE);
    this.scene.add(this.rig.root);
    this.billboard = new SkeletalBillboard(this.rig);
    this.scene.add(this.billboard.root);

    // Billboard 1:1 para animais (Javali, Peixe, Coelho, Galinha)
    const dummyTex = this.billboard.sprites.head.textures.front;
    this.creatureMapU = { value: dummyTex };
    this.creatureTexelU = { value: new THREE.Vector2(1 / 32, 1 / 32) };
    this.creatureMat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: this.creatureMapU,
        uTexelSize: this.creatureTexelU,
        uPixelSize: this.creaturePixelSizeU,
        uGridOrigin: this.creatureGridOriginU,
        uFlashColor: { value: new THREE.Color(0xffffff) },
        uFlashAmount: { value: 0 },
      },
      vertexShader: CREATURE_VERTEX_SHADER,
      fragmentShader: CREATURE_FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });
    this.creatureMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.creatureMat);
    this.creatureMesh.visible = false;
    this.creatureMesh.frustumCulled = false;
    this.scene.add(this.creatureMesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'si-canvas';
    this.stageEl.prepend(this.renderer.domElement);

    window.addEventListener('resize', () => {
      if (this.open) this.resizePreview();
    });
  }

  private resizePreview() {
    const rect = this.stageEl.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
    const h = Math.max(240, Math.floor(rect.height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private renderEntityTabs() {
    this.entityBarEl.innerHTML = '';
    for (const t of ENTITY_TABS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `si-entity-btn${t.key === this.entity ? ' active' : ''}`;
      btn.textContent = t.label;
      btn.addEventListener('click', () => this.selectEntity(t.key));
      this.entityBarEl.appendChild(btn);
    }
  }

  private selectEntity(key: EntityKey) {
    this.entity = key;
    this.locked = null;
    this.hudLockEl.classList.add('hidden');

    this.entityBarEl.querySelectorAll('.si-entity-btn').forEach((b, idx) => {
      b.classList.toggle('active', ENTITY_TABS[idx].key === key);
    });

    const isHero = key === 'hero';
    this.billboard.setVisible(isHero);
    this.heroAnim = 'idle';
    this.creatureMesh.visible = !isHero;
    this.hlWrapEl.style.display = isHero ? '' : 'none';

    if (isHero) {
      this.activeEntries = this.heroEntries;
      this.renderHeroAnimBar();
      this.renderHeroFilters();
      this.renderHeroSheet();
      const def = this.activeEntries.find((e) => e.codeName === 'HEAD_FRONT') ?? this.activeEntries[0];
      this.hovered = def;
      this.focusEntry(def, true);
    } else {
      const cfg = CREATURES[key];
      this.creatureAnimId = cfg.anims[0].id;
      this.creaturePose = cfg.anims[0].frames[0];
      this.renderCreatureAnimBar(cfg);
      this.renderCreaturePoseBar(cfg);
      this.rebuildCreatureSheet(cfg, true);
    }
  }

  private renderHeroAnimBar() {
    this.animBarEl.innerHTML = '<span class="si-bar-label">Animação:</span>';
    for (const a of HERO_ANIMS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `si-anim-btn${a.key === this.heroAnim ? ' active' : ''}`;
      btn.textContent = a.label;
      btn.addEventListener('click', () => {
        this.heroAnim = a.key;
        this.animBarEl.querySelectorAll('.si-anim-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      this.animBarEl.appendChild(btn);
    }
  }

  private renderHeroFilters() {
    this.filterBarEl.innerHTML = '';
    for (const f of HERO_FILTERS) {
      const count = this.heroEntries.filter((e) => this.matchesHeroFilter(e, f.key)).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `si-filter-btn${f.key === this.heroFilter ? ' active' : ''}`;
      btn.textContent = `${f.label} (${count})`;
      btn.addEventListener('click', () => {
        this.heroFilter = f.key;
        this.filterBarEl.querySelectorAll('.si-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderHeroSheet();
      });
      this.filterBarEl.appendChild(btn);
    }
  }

  private matchesHeroFilter(e: SpriteEntry, f: HeroFilterKey): boolean {
    if (f === 'all') return true;
    if (f === 'limbs') return e.part === 'upperArm' || e.part === 'forearm' || e.part === 'hand' || e.part === 'thigh';
    return e.part === f;
  }

  private renderCreatureAnimBar(cfg: CreatureConfig) {
    this.animBarEl.innerHTML = '<span class="si-bar-label">Animação:</span>';
    const turnAnims: CreatureAnimDef[] = [
      { id: '__turn_left', label: '↺ Virar Esq.', frames: cfg.anims[0].frames, fps: 7, isCycle: true },
      { id: '__turn_right', label: '↻ Virar Dir.', frames: cfg.anims[0].frames, fps: 7, isCycle: true },
    ];
    for (const a of cfg.key === 'traveler' ? cfg.anims : [...cfg.anims, ...turnAnims]) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `si-anim-btn${a.id === this.creatureAnimId ? ' active' : ''}`;
      btn.textContent = a.label;
      btn.addEventListener('click', () => {
        this.creatureAnimId = a.id;
        this.clockT = 0;
        this.creaturePose = a.frames[0];
        this.animBarEl.querySelectorAll('.si-anim-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.syncCreaturePoseButtons(cfg);
        this.rebuildCreatureSheet(cfg, false);
      });
      this.animBarEl.appendChild(btn);
    }
  }

  private renderCreaturePoseBar(cfg: CreatureConfig) {
    this.filterBarEl.innerHTML = '<span class="si-bar-label">Frame / Pose:</span>';
    for (const p of cfg.poses) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.pose = p.key;
      btn.className = `si-filter-btn${p.key === this.creaturePose ? ' active' : ''}`;
      btn.textContent = p.label;
      btn.addEventListener('click', () => {
        // Selecionar frame estático pausa o ciclo e mostra os 27 ângulos daquele frame
        this.creatureAnimId = '';
        this.creaturePose = p.key;
        this.animBarEl.querySelectorAll('.si-anim-btn').forEach((b) => b.classList.remove('active'));
        this.syncCreaturePoseButtons(cfg);
        this.rebuildCreatureSheet(cfg, false);
      });
      this.filterBarEl.appendChild(btn);
    }
  }

  private syncCreaturePoseButtons(cfg: CreatureConfig) {
    this.filterBarEl.querySelectorAll<HTMLButtonElement>('.si-filter-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.pose === this.creaturePose);
    });
    void cfg;
  }

  private rebuildCreatureSheet(cfg: CreatureConfig, instantCamera: boolean) {
    if (!cfg.poses.some((p) => p.key === this.creaturePose)) {
      const activeAnim = cfg.anims.find((a) => a.id === this.creatureAnimId) ?? cfg.anims[0];
      this.creaturePose = activeAnim?.frames[0] ?? cfg.poses[0].key;
      this.syncCreaturePoseButtons(cfg);
    }
    this.activeEntries = buildCreatureCatalog(cfg, this.creaturePose);
    this.renderCreatureSheet(cfg);
    // Mantém o ângulo aproximado ou foca 3/4 frente
    const prefix = `${cfg.key.toUpperCase()}_${this.creaturePose.toUpperCase()}`;
    const def = this.activeEntries.find((e) => e.codeName === `${prefix}_LEVEL_D2`) ?? this.activeEntries[0];
    this.hovered = def;
    this.focusEntry(def, instantCamera);
  }

  private addSheetSection(
    title: string,
    colHeaders: string[],
    rows: { label: string; cells: (string | null)[] }[],
    byCode: Map<string, SpriteEntry>,
  ) {
    const sec = document.createElement('div');
    sec.className = 'si-sheet-section';

    const h = document.createElement('div');
    h.className = 'si-group-title';
    h.textContent = title;
    sec.appendChild(h);

    const table = document.createElement('div');
    table.className = 'si-sheet';
    table.style.setProperty('--si-cols', String(colHeaders.length));

    const corner = document.createElement('div');
    corner.className = 'si-sheet-corner';
    table.appendChild(corner);
    for (const ch of colHeaders) {
      const th = document.createElement('div');
      th.className = 'si-sheet-col';
      th.textContent = ch;
      table.appendChild(th);
    }

    for (const row of rows) {
      const rl = document.createElement('div');
      rl.className = 'si-sheet-row-label';
      rl.textContent = row.label;
      table.appendChild(rl);

      for (const code of row.cells) {
        const entry = code ? byCode.get(code) : undefined;
        if (!entry) {
          const empty = document.createElement('div');
          empty.className = 'si-cell-empty';
          table.appendChild(empty);
          continue;
        }
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'si-cell';
        cell.title = `${entry.codeName} — ${entry.partLabel} (${entry.angleLabel})`;
        cell.innerHTML = `<img class="si-cell-img" src="${entry.dataUrl}" alt="${entry.codeName}" />`;

        cell.addEventListener('mouseenter', () => {
          this.hovered = entry;
          if (!this.locked) this.focusEntry(entry, false);
        });
        cell.addEventListener('click', () => {
          if (this.locked?.id === entry.id) {
            this.locked = null;
            this.hudLockEl.classList.add('hidden');
          } else {
            this.locked = entry;
            this.hudLockEl.classList.remove('hidden');
            this.focusEntry(entry, false);
          }
          this.syncCardStates();
        });

        table.appendChild(cell);
        this.cardEls.set(entry.id, cell);
      }
    }

    sec.appendChild(table);
    this.listEl.appendChild(sec);
  }

  private renderHeroSheet() {
    this.listEl.innerHTML = '';
    this.cardEls.clear();
    const byCode = new Map(this.heroEntries.map((e) => [e.codeName, e]));
    const cols5 = ['Frente 0°', '3/4 Fr. 45°', 'Lado 90°', '3/4 Cos. 135°', 'Costas 180°'];

    if (this.heroFilter === 'all' || this.heroFilter === 'head') {
      this.addSheetSection('Cabeça (27 sprites · 7 alturas × 5 direções)', cols5, [
        { label: 'Topo +80°', cells: ['HEAD_TOP', null, null, null, null] },
        { label: 'Alto +48°', cells: ['HEAD_HIGH_FRONT', 'HEAD_HIGH_FRONT_SIDE', 'HEAD_HIGH_SIDE', 'HEAD_HIGH_BACK_SIDE', 'HEAD_HIGH_BACK'] },
        { label: 'Méd+ +24°', cells: ['HEAD_MID_HIGH_FRONT', 'HEAD_MID_HIGH_FRONT_SIDE', 'HEAD_MID_HIGH_SIDE', 'HEAD_MID_HIGH_BACK_SIDE', 'HEAD_MID_HIGH_BACK'] },
        { label: 'Nível 0°', cells: ['HEAD_FRONT', 'HEAD_FRONT_SIDE', 'HEAD_SIDE', 'HEAD_BACK_SIDE', 'HEAD_BACK'] },
        { label: 'Méd- -24°', cells: ['HEAD_MID_LOW_FRONT', 'HEAD_MID_LOW_FRONT_SIDE', 'HEAD_MID_LOW_SIDE', 'HEAD_MID_LOW_BACK_SIDE', 'HEAD_MID_LOW_BACK'] },
        { label: 'Baixo -48°', cells: ['HEAD_LOW_FRONT', 'HEAD_LOW_FRONT_SIDE', 'HEAD_LOW_SIDE', 'HEAD_LOW_BACK_SIDE', 'HEAD_LOW_BACK'] },
        { label: 'Baixo -88°', cells: ['HEAD_BOTTOM', null, null, null, null] },
      ], byCode);
    }
    if (this.heroFilter === 'all' || this.heroFilter === 'torso') {
      this.addSheetSection('Torso (9 sprites)', cols5, [
        { label: 'Nível 0°', cells: ['TORSO_FRONT', 'TORSO_FRONT_SIDE', 'TORSO_SIDE', 'TORSO_BACK_SIDE', 'TORSO_BACK'] },
        { label: 'Alto / Topo', cells: ['TORSO_HIGH_FRONT', 'TORSO_HIGH_SIDE', 'TORSO_HIGH_BACK', 'TORSO_TOP', null] },
      ], byCode);
    }
    if (this.heroFilter === 'all' || this.heroFilter === 'pelvis') {
      this.addSheetSection('Pélvis / Quadril (9 sprites)', cols5, [
        { label: 'Nível 0°', cells: ['PELVIS_FRONT', 'PELVIS_FRONT_SIDE', 'PELVIS_SIDE', 'PELVIS_BACK_SIDE', 'PELVIS_BACK'] },
        { label: 'Alto / Topo', cells: ['PELVIS_HIGH_FRONT', 'PELVIS_HIGH_SIDE', 'PELVIS_HIGH_BACK', 'PELVIS_TOP', null] },
      ], byCode);
    }
    if (this.heroFilter === 'all' || this.heroFilter === 'shin') {
      this.addSheetSection('Canela + Bota (9 sprites)', cols5, [
        { label: 'Nível 0°', cells: ['SHIN_FRONT', 'SHIN_FRONT_SIDE', 'SHIN_SIDE', 'SHIN_BACK_SIDE', 'SHIN_BACK'] },
        { label: 'Alto / Topo', cells: ['SHIN_HIGH_FRONT', 'SHIN_HIGH_SIDE', 'SHIN_HIGH_BACK', 'SHIN_TOP', null] },
      ], byCode);
    }
    if (this.heroFilter === 'all' || this.heroFilter === 'limbs') {
      const armor = byCode.has('PAULDRON');
      const apron = byCode.has('TRAVELER_APRON');
      this.addSheetSection('Membros e extremidades', ['Braço Sup.', 'Antebraço', 'Mão', 'Coxa', armor ? 'Ombreira' : '', ...(apron ? ['Avental'] : [])], [
        { label: 'Qualquer', cells: ['UPPER_ARM', 'FOREARM', 'HAND', 'THIGH', armor ? 'PAULDRON' : null, ...(apron ? ['TRAVELER_APRON'] : [])] },
      ], byCode);
    }
    this.syncCardStates();
  }

  private renderCreatureSheet(cfg: CreatureConfig) {
    this.listEl.innerHTML = '';
    this.cardEls.clear();
    const byCode = new Map(this.activeEntries.map((e) => [e.codeName, e]));
    const p = `${cfg.key.toUpperCase()}_${this.creaturePose.toUpperCase()}`;
    const cols9 = CREATURE_YAWS.map(yaw => `${yaw}°`);
    if (byCode.has(`${p}_LEVEL_D9`)) {
      const dirs = Array.from({ length: 16 }, (_, i) => i);
      const bodyRow = (first: number, end: number) => dirs.slice(first, end).map(d => `${p}_LEVEL_D${d}`);
      this.addSheetSection(`${cfg.label} · ${this.creaturePose} · 16 direções`, cols9, [
        { label: 'Nível 0°', cells: bodyRow(0, 9) },
      ], byCode);
      this.addSheetSection('Vista pelo outro lado', dirs.slice(9).map(d => `${(d - 16) * 22.5}°`), [
        { label: 'Nível 0°', cells: bodyRow(9, 16) },
      ], byCode);
      this.syncCardStates();
      return;
    }
    const rowOf = (tier: string) => cols9.map((_, i) => `${p}_${tier}_D${i}`);
    const polarRow = (code: string) => [code, null, null, null, null, null, null, null, null];

    this.addSheetSection(`${cfg.label} · Pose "${this.creaturePose}" (16 direções × 9 alturas · ${cfg.pw}×${cfg.ph} px)`, cols9, [
      { label: 'Topo +88°', cells: polarRow(`${p}_TOP`) },
      { label: '+80°', cells: rowOf('P80') },
      { label: '+60°', cells: rowOf('P60') },
      { label: '+40°', cells: rowOf('P40') },
      { label: '+20°', cells: rowOf('P20') },
      { label: 'Nível 0°', cells: rowOf('LEVEL') },
      { label: '-20°', cells: rowOf('M20') },
      { label: '-40°', cells: rowOf('M40') },
      { label: '-60°', cells: rowOf('M60') },
      { label: '-80°', cells: rowOf('M80') },
      { label: 'Baixo -88°', cells: polarRow(`${p}_BOTTOM`) },
    ], byCode);

    this.syncCardStates();
  }

  private syncCardStates() {
    const active = this.locked ?? this.hovered;
    for (const [id, el] of this.cardEls) {
      el.classList.toggle('active', active?.id === id);
      el.classList.toggle('locked', this.locked?.id === id);
    }
  }

  private focusEntry(entry: SpriteEntry, instant: boolean) {
    this.goalYaw = THREE.MathUtils.degToRad(entry.camYawDeg);
    this.goalPitch = THREE.MathUtils.degToRad(entry.camPitchDeg);
    this.goalTargetY = entry.targetY;
    this.goalDist = entry.camDist;

    if (instant) {
      this.curYaw = this.goalYaw;
      this.curPitch = this.goalPitch;
      this.curTargetY = this.goalTargetY;
      this.curDist = this.goalDist;
    }

    this.infoThumbEl.src = entry.dataUrl;
    this.infoNameEl.textContent = `${entry.codeName} (${entry.w}×${entry.h} px)`;
    this.infoPartEl.textContent = `${entry.partLabel} · ${entry.jointLabel}`;
    this.infoAngleEl.textContent = `Ângulo: ${entry.angleLabel}${entry.mirrorNote ? ` — ${entry.mirrorNote}` : ''}`;
    this.infoCondEl.textContent = `Regra: ${entry.condition}`;
    this.hudPartEl.textContent = `${entry.partLabel}`;

    this.syncCardStates();
  }

  private bindStageOrbit() {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.goalYaw -= dx * 0.012;
      this.goalPitch = THREE.MathUtils.clamp(this.goalPitch + dy * 0.01, -Math.PI * 0.44, Math.PI * 0.46);
    });
    const endDrag = () => { this.dragging = false; };
    dom.addEventListener('pointerup', endDrag);
    dom.addEventListener('pointercancel', endDrag);
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.goalDist = THREE.MathUtils.clamp(this.goalDist + e.deltaY * 0.0025, 1.2, 6.0);
    }, { passive: false });
  }

  private animateHeroPreview(t: number, rig: HumanoidRig) {
    const j = rig.joints;
    // Reset base
    rig.body.position.set(0, rig.bodyPivotY, 0);
    rig.body.rotation.set(0, 0, 0);
    j.spine.rotation.set(0, 0, 0);
    j.chest.rotation.set(0, 0, 0);
    j.head.rotation.set(0, 0, 0);
    j.thighL.rotation.set(0, 0, 0);
    j.thighR.rotation.set(0, 0, 0);
    j.shinL.rotation.set(0, 0, 0);
    j.shinR.rotation.set(0, 0, 0);
    j.upperArmR.rotation.set(0, 0, -0.14);
    j.upperArmL.rotation.set(0, 0, 0.14);
    j.forearmR.rotation.set(-0.12, 0, 0);
    j.forearmL.rotation.set(-0.12, 0, 0);

    if (this.heroAnim === 'idle') {
      const b = Math.sin(t * 2.2) * 0.012;
      rig.body.position.y = rig.bodyPivotY + b;
    } else if (this.heroAnim === 'walk' || this.heroAnim === 'run') {
      const isRun = this.heroAnim === 'run';
      const w = t * (isRun ? 10.5 : 6.2);
      const amp = isRun ? 0.85 : 0.48;
      const s = Math.sin(w);
      rig.body.position.y = rig.bodyPivotY + Math.abs(Math.cos(w)) * (isRun ? 0.065 : 0.03);
      j.spine.rotation.x = isRun ? 0.22 : 0.08;
      j.thighL.rotation.x = s * amp;
      j.thighR.rotation.x = -s * amp;
      j.shinL.rotation.x = Math.max(0, -s) * (isRun ? 1.15 : 0.65);
      j.shinR.rotation.x = Math.max(0, s) * (isRun ? 1.15 : 0.65);
      j.upperArmL.rotation.x = -s * amp * 0.85;
      j.upperArmR.rotation.x = s * amp * 0.85;
      j.forearmL.rotation.x = isRun ? -0.95 : -0.35;
      j.forearmR.rotation.x = isRun ? -0.95 : -0.35;
    } else if (this.heroAnim === 'jump') {
      const p = (t * 1.4) % 1;
      const arc = Math.sin(p * Math.PI);
      rig.body.position.y = rig.bodyPivotY + arc * 0.45;
      j.thighL.rotation.x = -0.55 * arc;
      j.thighR.rotation.x = -0.30 * arc;
      j.shinL.rotation.x = 0.85 * arc;
      j.shinR.rotation.x = 0.55 * arc;
      j.upperArmL.rotation.z = 0.14 + 0.55 * arc;
      j.upperArmR.rotation.z = -0.14 - 0.55 * arc;
    }
  }

  private updateCreaturePreview(cfg: CreatureConfig) {
    const isTurnLeft = this.creatureAnimId === '__turn_left';
    const isTurnRight = this.creatureAnimId === '__turn_right';
    const isTurning = isTurnLeft || isTurnRight;
    const turnDir = isTurnLeft ? 1 : isTurnRight ? -1 : 0;
    const turning = isTurning ? previewAnimalTurn(this.clockT, turnDir) : undefined;
    const anim = cfg.anims.find((a) => a.id === this.creatureAnimId);
    let poseKey = this.creaturePose;
    let yOff = 0;

    if (anim) {
      const idx = Math.floor(this.clockT * anim.fps) % anim.frames.length;
      poseKey = anim.frames[idx];
      if (anim.bobAmp) yOff += Math.abs(Math.sin(this.clockT * anim.fps * Math.PI * 0.5)) * anim.bobAmp;
      if (anim.hopAmp) yOff += Math.sin((this.clockT * 2.2) % Math.PI) * anim.hopAmp;
    }

    const pack = cfg.getPack(poseKey);
    const cy = cfg.centerY + yOff;

    this.camera.getWorldPosition(this.camPos);
    this.camUp.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
    this.camBack.setFromMatrixColumn(this.camera.matrixWorld, 2).normalize();
    this.camFwd.copy(this.camBack).negate();

    this.toCam.set(this.camPos.x, this.camPos.y - cy, this.camPos.z).normalize();
    const upDot = this.toCam.y;
    const turnYaw = turning?.yaw ?? 0;
    const cosY = Math.cos(turnYaw);
    const sinY = Math.sin(turnYaw);
    const fwdDot = this.toCam.x * sinY + this.toCam.z * cosY;
    const leftDot = this.toCam.x * cosY - this.toCam.z * sinY;

    const { tex, flipX, isPolar } = pick27View(pack, upDot, fwdDot, leftDot, true);
    if (isPolar) {
      this.tmp.set(0, 0, 1).addScaledVector(this.camBack, -this.camBack.z);
      if (this.tmp.lengthSq() > 1e-4) this.yAxis.copy(this.tmp).normalize();
      else this.yAxis.copy(this.camUp);
    } else {
      this.yAxis.copy(this.camUp);
    }

    this.zAxis.copy(this.camBack);
    this.xAxis.crossVectors(this.yAxis, this.zAxis).normalize();
    this.basisMat.makeBasis(this.xAxis, this.yAxis, this.zAxis);
    this.creatureMesh.quaternion.setFromRotationMatrix(this.basisMat);
    this.creatureMesh.position.set(0, cy, 0);
    const bufW = this.bufSize.x || 640;
    const bufH = this.bufSize.y || 480;
    const p = actorScreenPixelSize(bufH);
    if (tex) {
      const scale = getRealWorldScale(cfg.key, cfg.worldH);
      const resolution = actorSpriteResolution(cfg.worldW * scale, cfg.worldH * scale);
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) * .5);
      const depth = Math.max(.5, this.tmp.subVectors(this.creatureMesh.position, this.camPos).dot(this.camFwd));
      const visibleRows = bufH * cfg.worldH / (2 * depth * tanHalfFov * p);
      const turnTexture = turning?.pose && !isPolar
        ? getAnimalTurnTexture(pack, resolution, visibleRows, turning.pose, flipX) : undefined;
      const sample = this.renderer.domElement.dataset;
      if (turning) {
        sample.turnAngle = String(Math.round(turnYaw * 180 / Math.PI));
        sample.turnPose = turnTexture ? 'articulated' : 'neutral';
      } else if (sample.turnAngle !== undefined) {
        delete sample.turnAngle;
        delete sample.turnPose;
      }
      const displayed = turnTexture ?? (isTurning
        ? tex : getAnimalDensityTexture(pack, tex, resolution, visibleRows, isPolar ? Math.sign(upDot) : 0));
      this.creatureMesh.scale.set(flipX ? -cfg.worldW : cfg.worldW, cfg.worldH, 1);
      if (this.creatureMapU.value !== displayed) {
        this.renderer.domElement.dataset.spriteResolution = `${displayed.image.width}×${displayed.image.height}`;
      }
      this.creatureMapU.value = displayed;
      this.creatureTexelU.value.set(1 / displayed.image.width, 1 / displayed.image.height);
    }

    this.creaturePixelSizeU.value = p;
    this.ndc.copy(this.creatureMesh.position).project(this.camera);
    const sx = (this.ndc.x * 0.5 + 0.5) * bufW;
    const sy = (this.ndc.y * 0.5 + 0.5) * bufH;
    this.creatureGridOriginU.value.set(
      sx - ((cfg.pw & 1) ? 0.5 * p : 0),
      sy - ((cfg.ph & 1) ? 0.5 * p : 0),
    );
  }

  private loop = () => {
    if (!this.open) return;
    this.rafId = requestAnimationFrame(this.loop);

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameMs) / 1000);
    this.lastFrameMs = now;
    this.clockT += dt;

    const k = 1 - Math.exp(-12 * dt);
    const dYaw = Math.atan2(Math.sin(this.goalYaw - this.curYaw), Math.cos(this.goalYaw - this.curYaw));
    this.curYaw += dYaw * k;
    this.curPitch += (this.goalPitch - this.curPitch) * k;
    this.curTargetY += (this.goalTargetY - this.curTargetY) * k;
    this.curDist += (this.goalDist - this.curDist) * k;

    const cosP = Math.cos(this.curPitch);
    this.camera.position.set(
      -Math.sin(this.curYaw) * cosP * this.curDist,
      this.curTargetY + Math.sin(this.curPitch) * this.curDist,
      Math.cos(this.curYaw) * cosP * this.curDist,
    );
    this.camera.lookAt(0, this.curTargetY, 0);
    this.camera.updateMatrixWorld(true);

    const yawDeg = Math.round(((THREE.MathUtils.radToDeg(this.curYaw) % 360) + 360) % 360);
    const pitchDeg = Math.round(THREE.MathUtils.radToDeg(this.curPitch));
    this.hudAngleEl.textContent = `Pitch ${pitchDeg >= 0 ? '+' : ''}${pitchDeg}° · Yaw ${yawDeg}°`;

    this.renderer.getDrawingBufferSize(this.bufSize);

    if (!this.freezePlanes) {
      if (this.entity === 'hero') {
        this.animateHeroPreview(this.clockT, this.rig);
        const active = this.locked ?? this.hovered;
        if (this.highlightEnabled && active && active.part !== 'creature') {
          const pulse = 0.42 + 0.28 * (0.5 + 0.5 * Math.sin(this.clockT * 5.5));
          this.billboard.setHighlightPart(active.part, pulse);
        } else {
          this.billboard.setHighlightPart(null);
        }
        this.rig.root.updateMatrixWorld(true);
        this.billboard.update(this.camera, this.bufSize);
      } else {
        this.updateCreaturePreview(CREATURES[this.entity]);
      }
    }

    this.renderer.render(this.scene, this.camera);
  };
}
