import React from 'react';
import { CHARACTERS } from '../data/characters';
import { CharacterId, EmotionType } from '../types/pharmacy';

interface CharacterPortraitProps {
  characterId: CharacterId;
  emotion?: EmotionType;
  size?: number;
  className?: string;
}

const EMOTION_LABELS: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: 'Senang',
  [EmotionType.THINKING]: 'Berpikir',
  [EmotionType.PANICKED]: 'Terkejut',
  [EmotionType.SICK]: 'Lemas',
  [EmotionType.PROUD]: 'Bangga',
  [EmotionType.SERIOUS]: 'Serius',
};

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  emotion = EmotionType.HAPPY,
  size = 96,
  className = '',
}) => {
  const profile = CHARACTERS[characterId] || CHARACTERS.lios;
  const fur = profile.primaryColor;
  const accent = profile.secondaryColor;

  // Render species-specific outer ears/features behind the head
  const renderSpeciesBack = () => {
    switch (characterId) {
      case 'sali': // Axolotl gill fronds
        return (
          <g fill="#F4A29E">
            <ellipse cx="22" cy="48" rx="14" ry="6" transform="rotate(-22 22 48)" />
            <ellipse cx="20" cy="60" rx="15" ry="6" transform="rotate(-4 20 60)" />
            <ellipse cx="24" cy="72" rx="13" ry="5.5" transform="rotate(16 24 72)" />
            <ellipse cx="98" cy="48" rx="14" ry="6" transform="rotate(22 98 48)" />
            <ellipse cx="100" cy="60" rx="15" ry="6" transform="rotate(4 100 60)" />
            <ellipse cx="96" cy="72" rx="13" ry="5.5" transform="rotate(-16 96 72)" />
          </g>
        );
      case 'kael': // Wolf ears
        return (
          <g>
            <path d="M26 48 L22 14 L50 32 Z" fill={fur} />
            <path d="M28 42 L26 20 L44 33 Z" fill="#E5D5C5" />
            <path d="M94 48 L98 14 L70 32 Z" fill={fur} />
            <path d="M92 42 L94 20 L76 33 Z" fill="#E5D5C5" />
          </g>
        );
      case 'milo': // Long rabbit ears
        return (
          <g>
            <ellipse cx="36" cy="24" rx="10" ry="24" transform="rotate(-14 36 24)" fill={fur} />
            <ellipse cx="36" cy="25" rx="5.5" ry="17" transform="rotate(-14 36 25)" fill="#F3C5C5" />
            <ellipse cx="84" cy="24" rx="10" ry="24" transform="rotate(14 84 24)" fill={fur} />
            <ellipse cx="84" cy="25" rx="5.5" ry="17" transform="rotate(14 84 25)" fill="#F3C5C5" />
          </g>
        );
      case 'tobi': // Chameleon crest & curl
        return (
          <g>
            <path d="M44 26 Q60 6 76 28 Z" fill="#8CC49E" />
            <circle cx="24" cy="56" r="10" fill={fur} />
            <circle cx="96" cy="56" r="10" fill={fur} />
          </g>
        );
      case 'alia': // Fennec huge ears
        return (
          <g>
            <path d="M28 52 L10 12 L50 34 Z" fill={fur} />
            <path d="M28 46 L16 20 L44 35 Z" fill="#FADCD2" />
            <path d="M92 52 L110 12 L70 34 Z" fill={fur} />
            <path d="M92 46 L104 20 L76 35 Z" fill="#FADCD2" />
          </g>
        );
      case 'lios': // Hedgehog spikes
        return (
          <g fill="#6B5B4B">
            <circle cx="34" cy="30" r="12" />
            <circle cx="48" cy="22" r="13" />
            <circle cx="60" cy="20" r="14" />
            <circle cx="72" cy="22" r="13" />
            <circle cx="86" cy="30" r="12" />
            <circle cx="26" cy="44" r="11" />
            <circle cx="94" cy="44" r="11" />
          </g>
        );
      case 'bima': // Owl feather tufts
        return (
          <g fill="#5C4D3E">
            <path d="M26 42 L18 18 L44 30 Z" />
            <path d="M94 42 L102 18 L76 30 Z" />
          </g>
        );
      case 'sekar': // Tortoise straw hat & shell rim
        return (
          <g>
            <ellipse cx="60" cy="26" rx="44" ry="12" fill="#D4B483" />
            <path d="M32 24 Q60 4 88 24 Z" fill="#C49E66" />
          </g>
        );
      case 'hana': // Spotted deer ears & nurse cap
        return (
          <g>
            <ellipse cx="26" cy="42" rx="13" ry="7" transform="rotate(-24 26 42)" fill={fur} />
            <ellipse cx="94" cy="42" rx="13" ry="7" transform="rotate(24 94 42)" fill={fur} />
            <path d="M40 24 L46 12 L74 12 L80 24 Z" fill="#FAF9F5" stroke="#2C6E63" strokeWidth="1.5" />
            <path d="M57 18 H63 M60 15 V21" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );
      case 'koko': // Koala round fluffy ears
        return (
          <g>
            <circle cx="24" cy="46" r="16" fill={fur} />
            <circle cx="24" cy="46" r="9" fill="#E5E7EB" />
            <circle cx="96" cy="46" r="16" fill={fur} />
            <circle cx="96" cy="46" r="9" fill="#E5E7EB" />
          </g>
        );
      case 'bobi': // Beaver round ears
        return (
          <g>
            <circle cx="30" cy="34" r="10" fill={fur} />
            <circle cx="90" cy="34" r="10" fill={fur} />
          </g>
        );
      case 'geri': // Elephant huge ears
        return (
          <g>
            <ellipse cx="22" cy="58" rx="18" ry="26" fill={fur} />
            <ellipse cx="23" cy="58" rx="11" ry="18" fill="#D8C2C2" />
            <ellipse cx="98" cy="58" rx="18" ry="26" fill={fur} />
            <ellipse cx="97" cy="58" rx="11" ry="18" fill="#D8C2C2" />
          </g>
        );
      case 'mimi': // Cat ears
        return (
          <g>
            <path d="M26 48 L24 16 L48 32 Z" fill={fur} />
            <path d="M29 42 L28 23 L43 33 Z" fill="#F4A89F" />
            <path d="M94 48 L96 16 L72 32 Z" fill={fur} />
            <path d="M91 42 L92 23 L77 33 Z" fill="#F4A89F" />
          </g>
        );
      case 'nino': // Squirrel tufted ears
        return (
          <g>
            <path d="M28 46 Q20 14 44 28 Z" fill={fur} />
            <path d="M92 46 Q100 14 76 28 Z" fill={fur} />
          </g>
        );
      case 'riko': // Iguana crest & headband
        return (
          <g>
            <path d="M48 24 L54 12 L60 22 L66 11 L72 24 Z" fill="#3B826E" />
          </g>
        );
      case 'pipi': // Pigeon head feathers
        return (
          <g>
            <ellipse cx="60" cy="24" rx="14" ry="8" fill="#B8C2BC" />
          </g>
        );
      case 'lili': // Red panda round ears with cream inner & dark tip
        return (
          <g>
            <circle cx="30" cy="34" r="12" fill={fur} />
            <circle cx="30" cy="34" r="7" fill="#FAF9F5" />
            <circle cx="90" cy="34" r="12" fill={fur} />
            <circle cx="90" cy="34" r="7" fill="#FAF9F5" />
          </g>
        );
      case 'cici': // Raccoon pointed ears with cream trim
        return (
          <g>
            <path d="M25 46 L24 16 L48 31 Z" fill={fur} />
            <path d="M28 41 L27 22 L43 32 Z" fill="#E2E8F0" />
            <path d="M95 46 L96 16 L72 31 Z" fill={fur} />
            <path d="M92 41 L93 22 L77 32 Z" fill="#E2E8F0" />
          </g>
        );
      case 'taro': // Brown bear sturdy round ears
        return (
          <g>
            <circle cx="29" cy="34" r="12" fill={fur} />
            <circle cx="29" cy="34" r="6.5" fill="#D4A373" />
            <circle cx="91" cy="34" r="12" fill={fur} />
            <circle cx="91" cy="34" r="6.5" fill="#D4A373" />
          </g>
        );
      case 'yuna': // Capybara small rounded high ears
        return (
          <g>
            <ellipse cx="32" cy="33" rx="9" ry="7" transform="rotate(-24 32 33)" fill={fur} />
            <ellipse cx="32" cy="34" rx="5" ry="4" transform="rotate(-24 32 34)" fill="#8C6239" />
            <ellipse cx="88" cy="33" rx="9" ry="7" transform="rotate(24 88 33)" fill={fur} />
            <ellipse cx="88" cy="34" rx="5" ry="4" transform="rotate(24 88 34)" fill="#8C6239" />
          </g>
        );
      case 'dodo': // River duck sailor cap
        return (
          <g>
            <path d="M36 28 Q60 12 84 28 Z" fill="#FAF9F5" stroke="#0A9396" strokeWidth="2" />
            <rect x="42" y="24" width="36" height="6" rx="3" fill="#0A9396" />
          </g>
        );
      case 'sora': // Fluffy cotton sheep cloud crown & floppy ears
        return (
          <g>
            <circle cx="42" cy="24" r="11" fill="#FFFFFF" />
            <circle cx="60" cy="20" r="13" fill="#FFFFFF" />
            <circle cx="78" cy="24" r="11" fill="#FFFFFF" />
            <ellipse cx="22" cy="48" rx="11" ry="6.5" transform="rotate(-28 22 48)" fill="#E6D5C3" />
            <ellipse cx="98" cy="48" rx="11" ry="6.5" transform="rotate(28 98 48)" fill="#E6D5C3" />
          </g>
        );
      default:
        return null;
    }
  };

  // Eyes and Brows modulated by EmotionType
  const renderEyesAndBrows = () => {
    const eyeY = 54;
    const leftX = 44;
    const rightX = 76;

    switch (emotion) {
      case EmotionType.HAPPY:
        return (
          <g>
            <ellipse cx={leftX} cy={eyeY} rx="4.2" ry="6.2" fill="#10241F" />
            <ellipse cx={rightX} cy={eyeY} rx="4.2" ry="6.2" fill="#10241F" />
            <circle cx={leftX - 1.3} cy={eyeY - 2.2} r="1.8" fill="#FFFFFF" />
            <circle cx={rightX - 1.3} cy={eyeY - 2.2} r="1.8" fill="#FFFFFF" />
            <circle cx={leftX + 1.3} cy={eyeY + 2.0} r="0.9" fill="#FFFFFF" opacity="0.88" />
            <circle cx={rightX + 1.3} cy={eyeY + 2.0} r="0.9" fill="#FFFFFF" opacity="0.88" />
            <path d="M37 42 Q44 38 50 42" stroke="#16302B" strokeWidth="2.1" fill="none" strokeLinecap="round" />
            <path d="M70 42 Q76 38 83 42" stroke="#16302B" strokeWidth="2.1" fill="none" strokeLinecap="round" />
            <ellipse cx="34" cy="64" rx="6.2" ry="3.4" fill="#F48B82" opacity="0.65" />
            <ellipse cx="86" cy="64" rx="6.2" ry="3.4" fill="#F48B82" opacity="0.65" />
          </g>
        );
      case EmotionType.PROUD:
        return (
          <g>
            <path d="M38 55 Q44 48 50 55" stroke="#16302B" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M70 55 Q76 48 82 55" stroke="#16302B" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M37 44 Q44 39 50 43" stroke="#16302B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M70 43 Q76 39 83 44" stroke="#16302B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="34" cy="64" rx="6" ry="3.2" fill="#F4A29E" opacity="0.62" />
            <ellipse cx="86" cy="64" rx="6" ry="3.2" fill="#F4A29E" opacity="0.62" />
            {/* Sparkle */}
            <path d="M98 22 L100 28 L106 30 L100 32 L98 38 L96 32 L90 30 L96 28 Z" fill="#D97706" />
          </g>
        );
      case EmotionType.THINKING:
        return (
          <g>
            <ellipse cx={leftX + 1.4} cy={eyeY - 0.8} rx="3.9" ry="5.6" fill="#10241F" />
            <ellipse cx={rightX + 1.4} cy={eyeY - 0.8} rx="3.9" ry="5.6" fill="#10241F" />
            <circle cx={leftX + 0.3} cy={eyeY - 2.6} r="1.6" fill="#FFFFFF" />
            <circle cx={rightX + 0.3} cy={eyeY - 2.6} r="1.6" fill="#FFFFFF" />
            <path d="M37 41 Q44 43 51 41" stroke="#16302B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M70 39 Q76 35 83 39" stroke="#16302B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>
        );
      case EmotionType.PANICKED:
        return (
          <g>
            <ellipse cx={leftX} cy={eyeY} rx="5.2" ry="6.4" fill="#FFFFFF" stroke="#16302B" strokeWidth="1.6" />
            <ellipse cx={rightX} cy={eyeY} rx="5.2" ry="6.4" fill="#FFFFFF" stroke="#16302B" strokeWidth="1.6" />
            <circle cx={leftX} cy={eyeY} r="2.3" fill="#16302B" />
            <circle cx={rightX} cy={eyeY} r="2.3" fill="#16302B" />
            <path d="M36 41 Q44 35 51 40" stroke="#16302B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M69 40 Q76 35 84 41" stroke="#16302B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Sweat drop */}
            <path d="M92 34 C95 39 95 44 92 44 C89 44 89 39 92 34 Z" fill="#60A5FA" />
          </g>
        );
      case EmotionType.SICK:
        return (
          <g>
            <path d="M38 52 L50 56 L38 59" stroke="#16302B" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M82 52 L70 56 L82 59" stroke="#16302B" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M37 44 L50 48" stroke="#16302B" strokeWidth="2" strokeLinecap="round" />
            <path d="M83 44 L70 48" stroke="#16302B" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="36" cy="64" rx="6" ry="3.2" fill="#EF4444" opacity="0.34" />
            <ellipse cx="84" cy="64" rx="6" ry="3.2" fill="#EF4444" opacity="0.34" />
          </g>
        );
      case EmotionType.SERIOUS:
        return (
          <g>
            <ellipse cx={leftX} cy={eyeY} rx="4.0" ry="5.6" fill="#10241F" />
            <ellipse cx={rightX} cy={eyeY} rx="4.0" ry="5.6" fill="#10241F" />
            <circle cx={leftX - 1.2} cy={eyeY - 2.0} r="1.5" fill="#FFFFFF" />
            <circle cx={rightX - 1.2} cy={eyeY - 2.0} r="1.5" fill="#FFFFFF" />
            <path d="M37 42 L51 45" stroke="#16302B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M83 42 L69 45" stroke="#16302B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
    }
  };

  // Species-specific muzzle/beak/trunk + mouth by emotion
  const renderMuzzleAndMouth = () => {
    if (characterId === 'bima' || characterId === 'pipi' || characterId === 'dodo') {
      // Beak / Duck Bill
      return (
        <g>
          {characterId === 'dodo' ? (
            <ellipse cx="60" cy="65" rx="13" ry="6.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
          ) : (
            <path d="M54 60 L66 60 L60 70 Z" fill="#E09F3E" />
          )}
          {emotion === EmotionType.PANICKED && <circle cx="60" cy="67" r="3" fill="#7F1D1D" />}
        </g>
      );
    }

    if (characterId === 'geri') {
      // Elephant trunk
      return (
        <g>
          <path
            d="M55 62 Q54 78 65 82 Q69 83 68 78 Q62 76 64 62 Z"
            fill={fur}
            stroke="#6B7280"
            strokeWidth="1"
          />
          {emotion === EmotionType.HAPPY || emotion === EmotionType.PROUD ? (
            <path d="M50 66 Q54 71 58 67" stroke="#16302B" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : null}
        </g>
      );
    }

    // Standard cozy snout + mouth
    let mouthPath = 'M53 69 Q60 75 67 69';
    if (emotion === EmotionType.THINKING || emotion === EmotionType.SERIOUS) {
      mouthPath = 'M54 70 L66 70';
    } else if (emotion === EmotionType.SICK) {
      mouthPath = 'M53 73 Q56.5 68 60 72 Q63.5 68 67 73';
    } else if (emotion === EmotionType.PANICKED) {
      mouthPath = 'M56 71 A4 4.5 0 1 0 64 71 A4 4.5 0 1 0 56 71';
    }

    return (
      <g>
        <ellipse cx="60" cy="66" rx="13" ry="9" fill="#FAF9F5" opacity="0.88" />
        {/* Nose */}
        {characterId === 'koko' ? (
          <ellipse cx="60" cy="61" rx="5.5" ry="7" fill="#374151" />
        ) : characterId === 'bobi' ? (
          <>
            <ellipse cx="60" cy="61" rx="4.5" ry="3.2" fill="#4A3222" />
            <rect x="56.5" y="70" width="3.2" height="4" rx="1" fill="#FFFFFF" />
            <rect x="60.3" y="70" width="3.2" height="4" rx="1" fill="#FFFFFF" />
          </>
        ) : (
          <ellipse cx="60" cy="62" rx="3.5" ry="2.4" fill="#4B3832" />
        )}
        <path
          d={mouthPath}
          stroke="#16302B"
          strokeWidth="2.1"
          fill={emotion === EmotionType.PANICKED ? '#7F1D1D' : 'none'}
          strokeLinecap="round"
        />
      </g>
    );
  };

  // Accessories (glasses, collar, stethoscope, headband)
  const renderAccessories = () => {
    const isMedic =
      characterId === 'sali' ||
      characterId === 'kael' ||
      characterId === 'milo' ||
      characterId === 'tobi' ||
      characterId === 'lios' ||
      characterId === 'bima' ||
      characterId === 'hana' ||
      characterId === 'yuna';

    return (
      <g>
        {/* Coat / Collar at bottom with crisp lapel trim */}
        <path d="M26 114 Q32 87 60 87 Q88 87 94 114 Z" fill={isMedic ? '#FAF9F5' : accent} />
        <path d="M34 89 L52 103 L60 95 L68 103 L86 89" fill="none" stroke={accent} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M46 88 L60 100 L74 88" fill="#E8EFEA" opacity="0.92" />
        <circle cx="60" cy="106" r="2.2" fill="#D99B38" />

        {characterId === 'bima' && (
          <g>
            <path d="M44 90 Q46 108 60 108 Q74 108 76 90" fill="none" stroke="#1E293B" strokeWidth="2.4" />
            <circle cx="60" cy="108" r="3.8" fill="#D99B38" stroke="#1E293B" strokeWidth="1" />
          </g>
        )}

        {(characterId === 'sali' || characterId === 'bima' || characterId === 'tobi' || characterId === 'cici' || characterId === 'yuna') && (
          <g stroke="#B47B2C" strokeWidth="2" fill="none">
            <circle cx="44" cy="54" r="9.5" fill="#FFFFFF" fillOpacity="0.18" />
            <circle cx="76" cy="54" r="9.5" fill="#FFFFFF" fillOpacity="0.18" />
            <line x1="53.5" y1="54" x2="66.5" y2="54" />
          </g>
        )}

        {characterId === 'riko' && (
          <rect x="29" y="34" width="62" height="6" rx="3" fill="#2C6E63" />
        )}

        {characterId === 'lios' && (
          <g stroke="#92400E" strokeWidth="1.8" fill="none">
            <circle cx="44" cy="54" r="8.5" fill="#FFFFFF" fillOpacity="0.14" />
            <circle cx="76" cy="54" r="8.5" fill="#FFFFFF" fillOpacity="0.14" />
            <line x1="52.5" y1="54" x2="67.5" y2="54" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-[#FFD166]/35 border-2 border-[#2D2926] overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`${profile.name} (${EMOTION_LABELS[emotion]})`}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full" aria-label={`${profile.name} ekspresi ${EMOTION_LABELS[emotion]}`}>
        <defs>
          <radialGradient id={`bg-${characterId}`} cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FAF9F5" />
            <stop offset="100%" stopColor="#D6E5DC" />
          </radialGradient>
          <radialGradient id={`shade-${characterId}`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#16302B" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <rect width="120" height="120" fill={`url(#bg-${characterId})`} />
        {renderSpeciesBack()}
        {/* Sculpted Head with volumetric lighting gradient */}
        <ellipse cx="60" cy="56" rx="33" ry="30" fill={fur} />
        <ellipse cx="60" cy="56" rx="33" ry="30" fill={`url(#shade-${characterId})`} />
        {/* Soft cheek fur tufts for furry species */}
        {(characterId === 'kael' || characterId === 'alia' || characterId === 'mimi' || characterId === 'nino') && (
          <g fill={fur}>
            <path d="M27 56 L22 61 L30 64 Z" />
            <path d="M93 56 L98 61 L90 64 Z" />
          </g>
        )}
        {/* Cute sculpted bangs tuft on forehead */}
        {(characterId === 'sali' || characterId === 'kael' || characterId === 'milo' || characterId === 'tobi') && (
          <g>
            <path d="M34 32 Q60 12 86 32 L78 22 L42 22 Z" fill="#2EA078" />
            <path d="M46 31 L53 40 L59 31 L65 39 L72 30 Z" fill={fur} />
          </g>
        )}
        {/* Deer spots */}
        {characterId === 'hana' && (
          <g fill="#FAF9F5" opacity="0.85">
            <circle cx="38" cy="40" r="2.2" />
            <circle cx="45" cy="36" r="1.8" />
            <circle cx="80" cy="39" r="2.2" />
          </g>
        )}
        {/* Red panda cream cheek stripes */}
        {characterId === 'lili' && (
          <g fill="#FAF9F5" opacity="0.9">
            <ellipse cx="38" cy="61" rx="7" ry="4.5" />
            <ellipse cx="82" cy="61" rx="7" ry="4.5" />
          </g>
        )}
        {/* Raccoon dark bandit eye patches */}
        {characterId === 'cici' && (
          <g fill="#374151" opacity="0.82">
            <ellipse cx="44" cy="54" rx="11" ry="8.5" transform="rotate(-10 44 54)" />
            <ellipse cx="76" cy="54" rx="11" ry="8.5" transform="rotate(10 76 54)" />
          </g>
        )}
        {renderEyesAndBrows()}
        {renderMuzzleAndMouth()}
        {renderAccessories()}
      </svg>
    </div>
  );
};
