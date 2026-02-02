# Human Design System -- Technical Research for Lightbloom

**Date:** 2026-01-31
**Purpose:** Implementation-level reference for building the Human Design calculator module
**Status:** Research Complete

---

## Table of Contents

1. [Calculation Method Overview](#1-calculation-method-overview)
2. [The Two Calculations: Personality and Design](#2-the-two-calculations-personality-and-design)
3. [Gate-to-Zodiac Degree Mapping (Complete)](#3-gate-to-zodiac-degree-mapping-complete)
4. [The 9 Centers and Their Gates](#4-the-9-centers-and-their-gates)
5. [The 36 Channels (Complete Definition)](#5-the-36-channels-complete-definition)
6. [Type Determination Algorithm](#6-type-determination-algorithm)
7. [Authority Determination Algorithm](#7-authority-determination-algorithm)
8. [Profile Determination](#8-profile-determination)
9. [Definition Type (Split Analysis)](#9-definition-type-split-analysis)
10. [Incarnation Cross](#10-incarnation-cross)
11. [Ephemeris and Planetary Requirements](#11-ephemeris-and-planetary-requirements)
12. [Open Source Projects and Libraries](#12-open-source-projects-and-libraries)
13. [Implementation Pseudocode](#13-implementation-pseudocode)

---

## 1. Calculation Method Overview

The Human Design chart is built from **two separate astronomical calculations** that together produce a complete "bodygraph." Both calculations use the same 13 celestial bodies/points, the tropical zodiac, and the true node calculation -- the same ephemeris foundation used in Western astrology.

**Step-by-step algorithm:**

1. Accept birth date, birth time, and birth location.
2. Convert birth time to UTC using the location's timezone.
3. Convert UTC datetime to a Julian Day Number.
4. **Personality Calculation (Conscious / Black):** Calculate all 13 planetary positions at the exact birth moment.
5. **Design Calculation (Unconscious / Red):**
   - Get the Sun's ecliptic longitude at birth (the "Personality Sun").
   - Subtract exactly 88 degrees from that longitude to get the "Design Sun" target longitude.
   - Search backwards in time using the ephemeris to find the exact Julian Day when the Sun was at that target longitude.
   - Calculate all 13 planetary positions at that discovered Design date/time.
6. Map each of the 26 planetary positions (13 Personality + 13 Design) to a gate number (1-64) and line number (1-6) using the Rave Mandala degree mapping.
7. Determine which channels are activated (both gates of a channel are present).
8. Determine which centers are defined (connected by at least one activated channel).
9. Derive Type, Authority, Profile, Definition Type, and Incarnation Cross.

**Sources:**
- [Jovian Archive - Personality vs. Design](https://www.jovianarchive.com/Human_Design/The_Chart_and_BodyGraph/Activation)
- [Gene Keys - Why 88 Degrees](https://genekeys.com/docs/whats-a-pre-natal-design-unconscious-planet-why-88-degrees/)
- [Swiss Ephemeris Discussion - 88 Degree Calculation](https://groups.io/g/swisseph/topic/date_when_the_sun_is_88/27498108)

---

## 2. The Two Calculations: Personality and Design

### Personality (Conscious) -- Black Side

- Calculated at the **exact moment of birth** (first breath).
- The birth must be the actual moment of birth regardless of whether the birth was natural, induced, or cesarean.
- Produces 13 gate activations (one per celestial body).
- Represented by black lines/numbers on the bodygraph.
- Represents the "who you think you are" -- conscious personality traits.

### Design (Unconscious) -- Red Side

- Calculated at the moment the Sun was **exactly 88 degrees earlier** in the zodiac than the Personality Sun position.
- This corresponds to approximately 88 days before birth (because the Sun moves about 1 degree per day).
- The exact date must be found by searching backwards through the ephemeris.
- Produces 13 gate activations (one per celestial body).
- Represented by red lines/numbers on the bodygraph.
- Represents the body, unconscious behaviors, and bio-genetic inheritance.

### Technical Detail: Finding the Design Date

The Design date is NOT simply "subtract 88 days." The Sun does not move at a perfectly uniform rate. The correct algorithm is:

```
1. personalitySunLongitude = getSunLongitude(birthJulianDay)
2. designSunLongitude = (personalitySunLongitude - 88.0 + 360.0) % 360.0
3. designJulianDay = searchBackwardsForSunAt(designSunLongitude, startingFrom: birthJulianDay)
4. designPlanets = calculateAllPlanets(designJulianDay)
```

The search in step 3 requires iterating backwards in time (using increasingly precise steps) until the Sun's calculated longitude matches the target to within an acceptable tolerance (typically < 0.001 degrees). A common approach is Newton's method or binary search against the ephemeris.

**Sources:**
- [Eden Carpenter - Conscious and Unconscious Designs](https://www.edencarpenter.com/blog/conscious-and-unconscious-designs)
- [Human Design Collective - In the Shadow of the Sun](https://humandesigncollective.com/in-the-shadow-of-the-sun/)

---

## 3. Gate-to-Zodiac Degree Mapping (Complete)

The 64 gates are distributed evenly around the 360-degree zodiac wheel. Each gate spans exactly **5.625 degrees** (360 / 64). Each gate contains 6 lines, so each line spans **0.9375 degrees** (5.625 / 6). This yields 384 distinct positions.

The gate order does NOT follow the numerical I Ching sequence. It follows the Rave Mandala order. The wheel starts with **Gate 41 at 2 degrees Aquarius** (the beginning of the Human Design year).

### Complete Mapping -- Mandala Order

**IMPORTANT NOTE on coordinate systems:** The degree ranges below use zodiac notation (sign + degree within sign). For implementation, convert to absolute ecliptic longitude (0-360 starting from 0 Aries):
- 0 Aries = 0 degrees
- 0 Taurus = 30 degrees
- 0 Gemini = 60 degrees
- ... and so on in 30-degree increments

The mandala offset from 0 Aries is accounted for by starting the gate sequence at Gate 25 at 28 deg 15 min Pisces (= 358.25 degrees absolute), which wraps around to Gate 17 starting at 3 deg 52 min 30 sec Aries (= 3.875 degrees absolute).

### Gate Order Array (starting from 0 degrees absolute, i.e. 0 Aries)

For implementation, the simplest approach is to define the 64 gates in order starting from 0 degrees Aries and working through 360 degrees. The gate at the 0-Aries boundary straddles Pisces/Aries:

| Index | Gate | Start Degrees (Abs) | I Ching Name |
|-------|------|---------------------|--------------|
| 0 | 25 | 358.250 | Innocence |
| 1 | 17 | 3.875 | Following |
| 2 | 21 | 9.500 | Biting Through |
| 3 | 51 | 15.125 | The Arousing |
| 4 | 42 | 20.750 | Increase |
| 5 | 3 | 26.375 | Difficulty at the Beginning |
| 6 | 27 | 32.000 | Nourishment |
| 7 | 24 | 37.625 | Returning |
| 8 | 2 | 43.250 | The Receptive |
| 9 | 23 | 48.875 | Splitting Apart |
| 10 | 8 | 54.500 | Holding Together |
| 11 | 20 | 60.125 | Contemplation |
| 12 | 16 | 65.750 | Enthusiasm |
| 13 | 35 | 71.375 | Progress |
| 14 | 45 | 77.000 | Gathering Together |
| 15 | 12 | 82.625 | Standstill |
| 16 | 15 | 88.250 | Modesty |
| 17 | 52 | 93.875 | Keeping Still |
| 18 | 39 | 99.500 | Obstruction |
| 19 | 53 | 105.125 | Development |
| 20 | 62 | 110.750 | Preponderance of the Small |
| 21 | 56 | 116.375 | The Wanderer |
| 22 | 31 | 122.000 | Influence |
| 23 | 33 | 127.625 | Retreat |
| 24 | 7 | 133.250 | The Army |
| 25 | 4 | 138.875 | Youthful Folly |
| 26 | 29 | 144.500 | The Abysmal |
| 27 | 59 | 150.125 | Dispersion |
| 28 | 40 | 155.750 | Deliverance |
| 29 | 64 | 161.375 | Before Completion |
| 30 | 47 | 167.000 | Oppression |
| 31 | 6 | 172.625 | Conflict |
| 32 | 46 | 178.250 | Pushing Upward |
| 33 | 18 | 183.875 | Work on What Has Been Spoilt |
| 34 | 48 | 189.500 | The Well |
| 35 | 57 | 195.125 | The Gentle |
| 36 | 32 | 200.750 | Duration |
| 37 | 50 | 206.375 | The Cauldron |
| 38 | 28 | 212.000 | Preponderance of the Great |
| 39 | 44 | 217.625 | Coming to Meet |
| 40 | 1 | 223.250 | The Creative |
| 41 | 43 | 228.875 | Breakthrough |
| 42 | 14 | 234.500 | Possession in Great Measure |
| 43 | 34 | 240.125 | The Power of the Great |
| 44 | 9 | 245.750 | Taming Power of the Small |
| 45 | 5 | 251.375 | Waiting |
| 46 | 26 | 257.000 | Taming Power of the Great |
| 47 | 11 | 262.625 | Peace |
| 48 | 10 | 268.250 | Treading |
| 49 | 58 | 273.875 | The Joyous |
| 50 | 38 | 279.500 | Opposition |
| 51 | 54 | 285.125 | The Marrying Maiden |
| 52 | 61 | 290.750 | Inner Truth |
| 53 | 60 | 296.375 | Limitation |
| 54 | 41 | 302.000 | Decrease |
| 55 | 19 | 307.625 | Approach |
| 56 | 13 | 313.250 | The Fellowship of Man |
| 57 | 49 | 318.875 | Revolution |
| 58 | 30 | 324.500 | Clinging Fire |
| 59 | 55 | 330.125 | Abundance |
| 60 | 37 | 335.750 | The Family |
| 61 | 63 | 341.375 | After Completion |
| 62 | 22 | 347.000 | Grace |
| 63 | 36 | 352.625 | Darkening of the Light |

**Implementation array** (gate numbers in mandala order starting from the Aries boundary at absolute 358.25 degrees -- but for simplest implementation, offset to start from absolute 0):

```typescript
// Gates in mandala order. Index 0 = the gate that contains 0 degrees absolute.
// 0 Aries falls inside Gate 25 (which starts at 358.25 degrees).
// The cleanest implementation: compute gateIndex = floor(adjustedLongitude / 5.625)
// where adjustedLongitude accounts for the mandala offset.

const MANDALA_GATE_ORDER: number[] = [
  25, 17, 21, 51, 42, 3,   // Aries
  27, 24, 2, 23, 8,         // Taurus
  20, 16, 35, 45, 12, 15,   // Gemini
  52, 39, 53, 62, 56,        // Cancer
  31, 33, 7, 4, 29,          // Leo
  59, 40, 64, 47, 6, 46,     // Virgo
  18, 48, 57, 32, 50,        // Libra
  28, 44, 1, 43, 14,         // Scorpio
  34, 9, 5, 26, 11, 10,      // Sagittarius
  58, 38, 54, 61, 60,        // Capricorn
  41, 19, 13, 49, 30,        // Aquarius
  55, 37, 63, 22, 36,        // Pisces
];
// Total: 64 entries
```

**Longitude-to-gate conversion:**

```typescript
// The mandala starts at 358.25 degrees absolute (28 deg 15 min Pisces).
// This is the start of Gate 25, the first gate in the mandala order.
const MANDALA_START_DEGREE = 358.25;

function longitudeToGate(longitude: number): { gate: number; line: number } {
  // Shift longitude so that mandala start = 0
  let adjusted = (longitude - MANDALA_START_DEGREE + 360) % 360;

  const gateWidth = 360 / 64; // 5.625
  const gateIndex = Math.floor(adjusted / gateWidth);
  const gate = MANDALA_GATE_ORDER[gateIndex % 64];

  // Line within gate (1-6)
  const positionInGate = (adjusted % gateWidth) / gateWidth;
  const line = Math.min(Math.floor(positionInGate * 6) + 1, 6);

  return { gate, line };
}
```

**CRITICAL IMPLEMENTATION NOTE:** The existing reference implementation at `/docs/architecture/reference-implementations/hd-gate-mapping.ts` uses a simpler offset (starting from 0 Aries). The more precise implementation above accounts for the actual mandala start at 358.25 degrees (28 deg 15 min Pisces). In production, verify the offset against known charts from established calculators like mybodygraph.com or geneticmatrix.com.

**Sources:**
- [Barney and Flow - Gate + Zodiac Degrees](https://www.barneyandflow.com/gate-zodiac-degrees)
- [Bonnie Sorsby - Human Design Gates by Degree](https://bonniesorsby.com/human-design-gates-by-degree/)
- [Embody Your Design - Astrology Positions of HD Gates](https://www.embodyyourdesign.com/blog/cheatsheet-astrology-positions-of-human-design-gates)

---

## 4. The 9 Centers and Their Gates

Each of the 64 gates belongs to exactly one center. A center becomes **defined** (colored) when at least one complete channel running through it is activated. A center is **undefined** (white/open) when no complete channel runs through it.

### Complete Gate-to-Center Mapping

| Center | Shape | Motor? | Awareness? | Pressure? | Gate Count | Gate Numbers |
|--------|-------|--------|------------|-----------|------------|--------------|
| **Head** | Triangle (up) | No | No | Yes | 3 | 64, 61, 63 |
| **Ajna** | Triangle (down) | No | Yes | No | 6 | 47, 24, 4, 17, 43, 11 |
| **Throat** | Square | No | No | No | 11 | 62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16 |
| **G/Self/Identity** | Diamond | No | No | No | 8 | 7, 1, 13, 25, 46, 2, 15, 10 |
| **Heart/Ego/Will** | Triangle (small) | **Yes** | No | No | 4 | 21, 26, 51, 40 |
| **Spleen** | Triangle (down) | No | Yes | No | 7 | 48, 57, 44, 50, 32, 28, 18 |
| **Sacral** | Square | **Yes** | No | No | 9 | 5, 14, 29, 59, 9, 3, 42, 27, 34 |
| **Solar Plexus/ESP** | Triangle (down) | **Yes** | Yes | No | 7 | 36, 22, 37, 6, 49, 55, 30 |
| **Root** | Square | **Yes** | No | Yes | 9 | 53, 60, 52, 19, 39, 41, 58, 38, 54 |

**Key implementation detail:** The **4 motor centers** are Heart, Sacral, Solar Plexus, and Root. This is critical for Type determination (motor-to-Throat connections).

**Sources:**
- [Jovian Archive - The Nine Centers of the BodyGraph](https://jovianarchive.com/pages/the-nine-centers-of-the-bodygraph-in-human-design)
- [A Human Design - Gates](https://ahumandesign.com/gates/)
- [Human Design Berufsberatung - 9 Centers and 64 Gates](https://humandesign-berufsberatung.de/en/human-design-centers/)

---

## 5. The 36 Channels (Complete Definition)

A channel is defined when BOTH of its gates are activated (by any planet, from either the Personality or Design calculation). When a channel is defined, both centers it connects become defined.

### Complete Channel List

| # | Channel | Gate A | Gate B | Center A | Center B | Circuit |
|---|---------|--------|--------|----------|----------|---------|
| 1 | 64-47 | 64 (Head) | 47 (Ajna) | Head | Ajna | Collective/Abstract |
| 2 | 61-24 | 61 (Head) | 24 (Ajna) | Head | Ajna | Individual/Knowing |
| 3 | 63-4 | 63 (Head) | 4 (Ajna) | Head | Ajna | Collective/Logic |
| 4 | 17-62 | 17 (Ajna) | 62 (Throat) | Ajna | Throat | Collective/Logic |
| 5 | 43-23 | 43 (Ajna) | 23 (Throat) | Ajna | Throat | Individual/Knowing |
| 6 | 11-56 | 11 (Ajna) | 56 (Throat) | Ajna | Throat | Collective/Abstract |
| 7 | 31-7 | 31 (Throat) | 7 (G) | Throat | G | Collective/Logic |
| 8 | 8-1 | 8 (Throat) | 1 (G) | Throat | G | Individual/Knowing |
| 9 | 33-13 | 33 (Throat) | 13 (G) | Throat | G | Collective/Abstract |
| 10 | 20-10 | 20 (Throat) | 10 (G) | Throat | G | Integration |
| 11 | 45-21 | 45 (Throat) | 21 (Heart) | Throat | Heart | Tribal/Ego |
| 12 | 12-22 | 12 (Throat) | 22 (ESP) | Throat | Solar Plexus | Individual/Knowing |
| 13 | 35-36 | 35 (Throat) | 36 (ESP) | Throat | Solar Plexus | Collective/Abstract |
| 14 | 16-48 | 16 (Throat) | 48 (Spleen) | Throat | Spleen | Collective/Logic |
| 15 | 20-57 | 20 (Throat) | 57 (Spleen) | Throat | Spleen | Integration |
| 16 | 20-34 | 20 (Throat) | 34 (Sacral) | Throat | Sacral | Integration |
| 17 | 46-29 | 46 (G) | 29 (Sacral) | G | Sacral | Collective/Abstract |
| 18 | 15-5 | 15 (G) | 5 (Sacral) | G | Sacral | Collective/Logic |
| 19 | 2-14 | 2 (G) | 14 (Sacral) | G | Sacral | Individual/Knowing |
| 20 | 10-34 | 10 (G) | 34 (Sacral) | G | Sacral | Integration |
| 21 | 25-51 | 25 (G) | 51 (Heart) | G | Heart | Individual/Centering |
| 22 | 10-57 | 10 (G) | 57 (Spleen) | G | Spleen | Integration |
| 23 | 26-44 | 26 (Heart) | 44 (Spleen) | Heart | Spleen | Tribal/Ego |
| 24 | 40-37 | 40 (Heart) | 37 (ESP) | Heart | Solar Plexus | Tribal/Ego |
| 25 | 50-27 | 50 (Spleen) | 27 (Sacral) | Spleen | Sacral | Tribal/Defense |
| 26 | 57-34 | 57 (Spleen) | 34 (Sacral) | Spleen | Sacral | Integration |
| 27 | 44-26 | 44 (Spleen) | 26 (Heart) | Spleen | Heart | Tribal/Ego |
| 28 | 28-38 | 28 (Spleen) | 38 (Root) | Spleen | Root | Individual/Knowing |
| 29 | 18-58 | 18 (Spleen) | 58 (Root) | Spleen | Root | Collective/Logic |
| 30 | 32-54 | 32 (Spleen) | 54 (Root) | Spleen | Root | Tribal/Ego |
| 31 | 6-59 | 6 (ESP) | 59 (Sacral) | Solar Plexus | Sacral | Tribal/Defense |
| 32 | 49-19 | 49 (ESP) | 19 (Root) | Solar Plexus | Root | Tribal/Defense |
| 33 | 55-39 | 55 (ESP) | 39 (Root) | Solar Plexus | Root | Individual/Knowing |
| 34 | 30-41 | 30 (ESP) | 41 (Root) | Solar Plexus | Root | Collective/Abstract |
| 35 | 42-53 | 42 (Sacral) | 53 (Root) | Sacral | Root | Collective/Abstract |
| 36 | 3-60 | 3 (Sacral) | 60 (Root) | Sacral | Root | Individual/Knowing |
| 37 | 9-52 | 9 (Sacral) | 52 (Root) | Sacral | Root | Collective/Logic |

**Note:** Channels 23 and 27 (26-44 and 44-26) are the same channel listed from different directions. The deduped count is 36 unique channels. In implementation, ensure you store each channel only once.

### Integration Channels

There are 4 special "Integration" channels that form a unique sub-circuit:
- 20-10 (Throat to G)
- 20-57 (Throat to Spleen)
- 20-34 (Throat to Sacral)
- 10-34 (G to Sacral)
- 10-57 (G to Spleen)
- 57-34 (Spleen to Sacral)

The integration gates are: **34, 20, 10, 57**.

**Sources:**
- [A Human Design - Channels](https://ahumandesign.com/channels/)
- [Human Design System - 36 Channels](https://humandesignsystem.co/en/36-channels-of-the-human-design-chart/)
- [Human Design Zone - 36 Channels and 64 Gates](https://humandesign.zone/crash-course/4-the-36-channels-and-64-gates-in-human-design)

---

## 6. Type Determination Algorithm

Type is the most fundamental property of a Human Design chart. It is determined by the configuration of defined centers, specifically the Sacral center and motor-to-Throat connections.

### Decision Tree (Implement in This Order)

```
Step 1: Are ALL centers undefined?
  YES -> Reflector (approximately 1% of population)
  NO  -> Continue

Step 2: Is the SACRAL center defined?
  NO  -> Go to Step 3
  YES -> Is there a continuous path of defined channels
         from ANY motor center to the THROAT center?
    YES -> Manifesting Generator (approximately 33%)
    NO  -> Generator (approximately 37%)

Step 3: (Sacral is NOT defined)
  Is there a continuous path of defined channels
  from ANY non-Sacral motor center (Heart, Solar Plexus, Root)
  to the THROAT center?
    YES -> Manifestor (approximately 9%)
    NO  -> Projector (approximately 20%)
```

### Implementation Notes

**Motor-to-Throat path detection** requires a graph traversal algorithm (BFS or DFS). The path can be INDIRECT -- a motor does not need a direct channel to the Throat. For example, if the Root connects to the Spleen via channel 18-58, and the Spleen connects to the Throat via channel 48-16, then there is a motor-to-Throat path (Root -> Spleen -> Throat), making this person a Manifestor (assuming no defined Sacral).

**The 4 motor centers are:** Heart/Ego, Sacral, Solar Plexus, Root.

**Critical distinction for Manifesting Generator vs. Generator:**
- A Manifesting Generator has a defined Sacral AND a motor-to-Throat connection.
- A pure Generator has a defined Sacral but NO motor-to-Throat connection.
- The motor that connects to the Throat for an MG can be the Sacral itself (e.g., via channel 34-20 directly connecting Sacral to Throat) or ANY other motor that reaches the Throat through defined channels.

**Channels that directly connect a motor to the Throat:**
- 12-22 (Throat <-> Solar Plexus)
- 35-36 (Throat <-> Solar Plexus)
- 45-21 (Throat <-> Heart)
- 20-34 (Throat <-> Sacral)
- 16-48 (Throat <-> Spleen -- Spleen is NOT a motor, so this alone does NOT create a Manifestor)

For indirect paths, the BFS must traverse through any intermediate defined centers.

**Sources:**
- [Jovian Archive - The 4 Human Design Types](https://jovianarchive.com/blogs/human-design-basics/the-4-human-design-types)
- [Health Manifested - What HD Type Am I?](https://healthmanifested.com/what-human-design-type-am-i/)
- [Free Human Design Chart - The 5 Types](https://freehumandesignchart.com/the-5-human-design-types/)

---

## 7. Authority Determination Algorithm

Authority determines the decision-making strategy. It follows a strict hierarchy: the highest defined center in the hierarchy wins.

### Hierarchy (Check in This Order)

```
Step 1: Is the SOLAR PLEXUS defined?
  YES -> Emotional Authority (approximately 58% of population)
         (This ALWAYS wins if Solar Plexus is defined, regardless of other centers)

Step 2: Is the SACRAL defined?
  YES -> Sacral Authority (approximately 29%)
         (Only Generators and Manifesting Generators can have this)

Step 3: Is the SPLEEN defined?
  YES -> Splenic Authority (approximately 8%)
         (Only Manifestors and Projectors can have this)

Step 4: Is the HEART/EGO defined?
  YES -> Is it connected to the Throat?
    YES -> Ego Manifested Authority (Manifestors)
    NO  -> Ego Projected Authority (Projectors)
         (Approximately 1.3% combined)

Step 5: Is the G CENTER defined?
  YES -> Self-Projected Authority (approximately 1.7%)
         (Only Projectors can have this)

Step 6: Are ONLY Head and/or Ajna centers defined? (No centers below Throat defined)
  YES -> Mental/Environmental Authority (approximately 1.6%)
         (Only Mental Projectors -- defined Head/Ajna only, or Head/Ajna/Throat)

Step 7: NO centers defined at all?
  YES -> Lunar Authority (approximately 0.7%)
         (Only Reflectors have this -- they wait a full 28-day lunar cycle)
```

### Implementation Notes

- Emotional Authority always takes precedence. Even if Sacral and Spleen are also defined, if Solar Plexus is defined, the authority is Emotional.
- Sacral Authority is exclusive to Generators and Manifesting Generators.
- Splenic Authority requires an undefined Solar Plexus and undefined Sacral.
- The Head, Ajna, Throat, and Root centers CANNOT serve as inner authority.
- Reflectors (no defined centers) always have Lunar Authority.

**Sources:**
- [A Human Design - Authority](https://ahumandesign.com/authority/)
- [The Aura Market - 7 HD Authorities](https://www.theauramarket.com/blogs/human-design/a-summary-of-the-seven-human-design-authorities)
- [Human Design Awakening - Authority Hierarchy](https://www.humandesignlifecoaching.com/blog/2018/12/22/how-to-make-correct-decisions-human-design-system-how-to-determine-authority)

---

## 8. Profile Determination

Profile is derived from the **line numbers** of the Personality Sun and Design Sun. It describes the role and life theme.

### Calculation

```
Profile = PersonalitySunLine / DesignSunLine
```

Where:
- **PersonalitySunLine** = the line (1-6) of the gate activated by the Sun at birth
- **DesignSunLine** = the line (1-6) of the gate activated by the Sun at the Design date

Example: If the Personality Sun is at Gate 8, Line 3, and the Design Sun is at Gate 30, Line 5, the Profile is **3/5**.

### The 12 Valid Profiles

Not all 36 possible line combinations are valid. Only 12 profiles exist because the Personality Sun and Design Sun are always 88 degrees apart, which constrains which line combinations can occur.

| Profile | Name | Cross Angle | Karma Type |
|---------|------|-------------|------------|
| 1/3 | Investigator / Martyr | Right Angle | Personal |
| 1/4 | Investigator / Opportunist | Right Angle | Personal |
| 2/4 | Hermit / Opportunist | Right Angle | Personal |
| 2/5 | Hermit / Heretic | Right Angle | Personal |
| 3/5 | Martyr / Heretic | Right Angle | Personal |
| 3/6 | Martyr / Role Model | Right Angle | Personal |
| 4/6 | Opportunist / Role Model | Right Angle | Personal |
| 4/1 | Opportunist / Investigator | Juxtaposition | Fixed |
| 5/1 | Heretic / Investigator | Left Angle | Transpersonal |
| 5/2 | Heretic / Hermit | Left Angle | Transpersonal |
| 6/2 | Role Model / Hermit | Left Angle | Transpersonal |
| 6/3 | Role Model / Martyr | Left Angle | Transpersonal |

### The 6 Lines

| Line | Name | Theme |
|------|------|-------|
| 1 | Investigator | Foundation, research, introspection |
| 2 | Hermit | Natural talent, needs calling out |
| 3 | Martyr | Trial and error, experimentation |
| 4 | Opportunist | Networks, community, opportunity |
| 5 | Heretic | Practical solutions, projection field |
| 6 | Role Model | Three life phases (0-30, 30-50, 50+) |

### Cross Angle (for Incarnation Cross)

- **Right Angle Cross (profiles with first number 1-4, except 4/1):** Personal destiny
- **Juxtaposition Cross (4/1 only):** Fixed fate
- **Left Angle Cross (profiles 5/1, 5/2, 6/2, 6/3):** Transpersonal destiny

**Sources:**
- [Humdes.com - Profiles in Human Design](https://www.humdes.com/en/kb/profiles/)
- [Manifesting Human Design - 12 Profiles](https://manifestinghumandesign.com/human-design-profiles/)
- [The Aura Market - 6 Profile Lines](https://www.theauramarket.com/blogs/human-design/a-summary-of-the-6-profile-lines)

---

## 9. Definition Type (Split Analysis)

Definition type describes how the defined centers in a chart are connected to each other. It is determined by counting the number of separate connected components among defined centers.

### Algorithm

```
1. Build a graph where nodes = defined centers
2. Edges = defined channels between those centers
3. Count the number of connected components

0 components (no defined centers)    -> No Definition (Reflector only)
1 connected component                -> Single Definition
2 connected components               -> Split Definition
3 connected components               -> Triple Split Definition
4 connected components               -> Quadruple Split Definition
```

### Population Distribution

| Definition Type | Percentage |
|-----------------|------------|
| No Definition | approximately 1.45% |
| Single Definition | approximately 41% |
| Split Definition | approximately 45-46% |
| Triple Split | approximately 11% |
| Quadruple Split | approximately 0.57% |

**Sources:**
- [Pure Generators - HD Definition Types](https://www.puregenerators.com/blog/human-design-definition-single-split-triple-split-quadruple-split)
- [Just Follow Joy - 5 HD Definition Types](https://justfollowjoy.com/blog/hd101-the-5-human-design-definition-types-single-split-triple-split-quadruple-split)

---

## 10. Incarnation Cross

The Incarnation Cross represents life purpose and is derived from the 4 Sun/Earth gate activations.

### Calculation

```
Incarnation Cross = {
  personalitySunGate:   gate of Personality Sun,
  personalityEarthGate: gate of Personality Earth,
  designSunGate:        gate of Design Sun,
  designEarthGate:      gate of Design Earth,
  angle:                derived from Profile (Right/Left/Juxtaposition)
}
```

**Earth gate note:** The Earth is always exactly opposite the Sun in the zodiac (180 degrees apart). So:
```
earthLongitude = (sunLongitude + 180) % 360
```

There are **192 named Incarnation Crosses** organized into:
- **64 Right Angle Crosses** (personal)
- **64 Left Angle Crosses** (transpersonal)
- **64 Juxtaposition Crosses** (fixed -- only for 4/1 profiles)

The cross name is determined by the Personality Sun gate combined with the angle type.

**Sources:**
- [A Human Design - Incarnation Crosses](https://ahumandesign.com/incarnation-cross/)
- [Freehumandesignchart.com - Incarnation Cross](https://freehumandesignchart.com/incarnation-cross/)

---

## 11. Ephemeris and Planetary Requirements

### The 13 Celestial Bodies/Points

Human Design uses exactly 13 planetary positions for each calculation (Personality and Design), for a total of 26 activations:

| # | Body/Point | Swiss Ephemeris Constant | HD Significance |
|---|------------|--------------------------|-----------------|
| 1 | Sun | `SE_SUN` | Primary gate activation, defines Profile line |
| 2 | Earth | Computed: Sun + 180 degrees | Grounding energy, Incarnation Cross |
| 3 | Moon | `SE_MOON` | Emotional security, drives |
| 4 | North Node | `SE_TRUE_NODE` | Life direction, environment |
| 5 | South Node | North Node + 180 degrees | Past patterns |
| 6 | Mercury | `SE_MERCURY` | Communication |
| 7 | Venus | `SE_VENUS` | Values, relationships |
| 8 | Mars | `SE_MARS` | Energy, action |
| 9 | Jupiter | `SE_JUPITER` | Growth, law |
| 10 | Saturn | `SE_SATURN` | Discipline, structure |
| 11 | Uranus | `SE_URANUS` | Innovation, disruption |
| 12 | Neptune | `SE_NEPTUNE` | Spirituality, illusion |
| 13 | Pluto | `SE_PLUTO` | Transformation, truth |

**Implementation notes:**
- Earth is NOT a separate ephemeris body. It is calculated as Sun + 180 degrees.
- South Node is NOT a separate ephemeris body. It is calculated as North Node + 180 degrees.
- Use `SE_TRUE_NODE` (true node), NOT `SE_MEAN_NODE` (mean node). Human Design always uses the true node calculation.
- Use the **tropical zodiac** (linked to equinoxes/solstices), which is the default for Swiss Ephemeris.

### Swiss Ephemeris Configuration

```typescript
// Required flags for HD calculations:
const flags = SEFLG_SWIEPH | SEFLG_SPEED; // Swiss Eph + speed for retrograde detection

// For each planet, call:
const result = swe_calc_ut(julianDay, planetId, flags);
// result[0] = ecliptic longitude (0-360)
// result[3] = speed in longitude (negative = retrograde)
```

### Recommended npm Packages

| Package | Platform | License | Best For |
|---------|----------|---------|----------|
| `sweph` (by timotejroiko) | Node.js only (native C++) | AGPL-3.0 | Server-side, highest precision |
| `sweph-wasm` (by PtPrashantTripathi) | Node.js + Browser | LGPL | Browser-based, TypeScript |
| `swisseph-wasm` (by prolaxu) | Node.js + Browser | GPL v3 | Cross-platform WASM |
| `swisseph` (by mivion) | Node.js only (native) | GPL | Older but stable Node.js binding |

For Lightbloom, **`sweph` by timotejroiko** is already selected in the architecture (server-side on Vercel, AGPL-3.0 is acceptable for server-side use).

**Sources:**
- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/swisseph.htm)
- [sweph GitHub](https://github.com/timotejroiko/sweph)
- [sweph-wasm GitHub](https://github.com/ptprashanttripathi/sweph-wasm)

---

## 12. Open Source Projects and Libraries

### Primary Open Source Projects

#### 1. hdkit (JavaScript/Ruby)
- **URL:** https://github.com/jdempcy/hdkit
- **Language:** JavaScript (npm module) + Ruby on Rails sample app
- **Features:** Bodygraph generation with SVG, planetary position data, React/Node sample app
- **Key files:** `hdkit.js` (core library), integration gates array `[34, 20, 10, 57]`, `gateOrder` and `harmonicOrder` arrays
- **License:** MIT
- **Notes:** World's first open-source HD toolkit (2016). Good reference for gate ordering and SVG rendering but does not include its own ephemeris -- relies on external API or hardcoded data.

#### 2. SharpAstrology.HumanDesign (C#/.NET)
- **URL:** https://github.com/CReizner/SharpAstrology.HumanDesign
- **Stars:** 51
- **Features:** Complete HD chart calculation including Type, Profile, Strategy, Split Definition, Incarnation Cross, active channels, Variables (Color, Tone, Base)
- **Ephemeris:** Uses Swiss Ephemeris via SharpAstrology.SwissEph. Supports both Swiss Eph files and JPL files.
- **License:** MIT
- **Notes:** Most feature-complete open-source HD calculator. Good algorithmic reference even though it is in C#.

#### 3. humandesign_api (Python)
- **URL:** https://github.com/dturkuler/humandesign_api
- **Stars:** 8
- **Language:** Python (FastAPI)
- **Features:** Energy Types, Profiles, Incarnation Crosses, Gates. Includes BodyGraph image generation (PNG/SVG/JPG).
- **Ephemeris:** Uses `pyswisseph` (Python wrapper for Swiss Ephemeris)
- **Key files:** `hd_constants.py` (gate/channel/center mappings), `hd_features.py` (core calculation), `chart.py` (visualization), `layout_data.json` (SVG coordinates)
- **Notes:** Good reference for Python implementation. Has FastAPI endpoints. Constants file is a useful data reference.

#### 4. MCP_Human_design (JavaScript/Node.js)
- **URL:** https://github.com/dvvolkovv/MCP_Human_design
- **Language:** JavaScript (Node.js)
- **Features:** Full HD calculation via Swiss Ephemeris. Outputs Type, Strategy, Authority, Profile, Gates (with gate number, name, line, planet), defined centers, Incarnation Cross.
- **Key files:** `src/calculations-cjs.cjs` (core calculation engine)
- **Notes:** Recent project (2025). Uses Swiss Ephemeris directly. Has both HTTP and MCP (Model Context Protocol) interfaces.

#### 5. Astrolo (C#/.NET)
- **URL:** https://github.com/schokee/Astrolo
- **Stars:** 7
- **Features:** .NET components for Gene Keys and Human Design applications.

### Commercial/Proprietary References

- **Maia Mechanics** (maiamechanics.com) - The "official" HD software. Closed source. Can be used to verify calculation accuracy.
- **mybodygraph.com** - Free chart generation from Jovian Archive. Use to validate calculations.
- **geneticmatrix.com** - Comprehensive chart calculator. Useful for validation.
- **bodygraph.io** - Modern calculator with clean interface.

**Sources:**
- [GitHub human-design topic](https://github.com/topics/human-design)
- [hdkit Repository](https://github.com/jdempcy/hdkit)
- [SharpAstrology.HumanDesign](https://github.com/CReizner/SharpAstrology.HumanDesign)
- [humandesign_api](https://github.com/dturkuler/humandesign_api)
- [MCP_Human_design](https://github.com/dvvolkovv/MCP_Human_design)

---

## 13. Implementation Pseudocode

This section provides a complete algorithmic outline for implementing the Human Design calculator in TypeScript for the Lightbloom application.

### Complete Calculation Pipeline

```typescript
// ============================================================
// MAIN ENTRY POINT
// ============================================================

function calculateHumanDesignChart(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,   // UTC decimal hours
  birthMinute: number,
  latitude: number,
  longitude: number
): HumanDesignChart {

  // STEP 1: Calculate Julian Day for birth moment
  const birthJD = dateToJulianDay(birthYear, birthMonth, birthDay, birthHour, birthMinute);

  // STEP 2: Calculate Personality (conscious) planetary positions
  const personalityPlanets = calculateAllPlanets(birthJD);

  // STEP 3: Find Design date (88 degrees solar arc before birth)
  const personalitySunLong = personalityPlanets.find(p => p.planet === 'Sun').longitude;
  const designSunTargetLong = (personalitySunLong - 88.0 + 360.0) % 360.0;
  const designJD = findJulianDayForSunAt(designSunTargetLong, birthJD);

  // STEP 4: Calculate Design (unconscious) planetary positions
  const designPlanets = calculateAllPlanets(designJD);

  // STEP 5: Map all planetary positions to gates
  const personalityGates = personalityPlanets.map(p => ({
    ...longitudeToGate(p.longitude),
    planet: p.planet,
    isPersonality: true,
    longitude: p.longitude,
  }));

  const designGates = designPlanets.map(p => ({
    ...longitudeToGate(p.longitude),
    planet: p.planet,
    isPersonality: false,
    longitude: p.longitude,
  }));

  const allGates = [...personalityGates, ...designGates];
  const activatedGateNumbers = new Set(allGates.map(g => g.gate));

  // STEP 6: Determine defined channels
  const definedChannels = CHANNEL_DEFINITIONS.filter(
    ch => activatedGateNumbers.has(ch.gate1) && activatedGateNumbers.has(ch.gate2)
  );

  // STEP 7: Determine defined centers
  const definedCenterNames = new Set<string>();
  for (const ch of definedChannels) {
    definedCenterNames.add(ch.center1);
    definedCenterNames.add(ch.center2);
  }

  // STEP 8: Determine Type
  const type = determineType(definedCenterNames, definedChannels);

  // STEP 9: Determine Authority
  const authority = determineAuthority(definedCenterNames, type);

  // STEP 10: Determine Profile
  const personalitySunLine = personalityGates.find(g => g.planet === 'Sun').line;
  const designSunLine = designGates.find(g => g.planet === 'Sun').line;
  const profile = `${personalitySunLine}/${designSunLine}`;

  // STEP 11: Determine Definition Type (graph connectivity)
  const definitionType = determineDefinitionType(definedCenterNames, definedChannels);

  // STEP 12: Determine Incarnation Cross
  const incarnationCross = determineIncarnationCross(
    personalityGates.find(g => g.planet === 'Sun').gate,
    personalityGates.find(g => g.planet === 'Earth').gate,
    designGates.find(g => g.planet === 'Sun').gate,
    designGates.find(g => g.planet === 'Earth').gate,
    profile
  );

  return {
    type,
    authority,
    profile,
    definitionType,
    incarnationCross,
    centers: buildCenterStates(definedCenterNames),
    channels: definedChannels,
    gates: allGates,
    personalityPlanets,
    designPlanets,
    designDate: julianDayToDate(designJD),
  };
}


// ============================================================
// DESIGN DATE FINDER (88-degree solar arc)
// ============================================================

function findJulianDayForSunAt(targetLongitude: number, startJD: number): number {
  // The Sun moves approximately 1 degree per day, so 88 degrees ~ 88 days
  let jd = startJD - 88.0; // Initial estimate

  // Newton-Raphson iteration to find exact JD
  for (let i = 0; i < 50; i++) {
    const sunPos = calculateSunPosition(jd);
    let diff = targetLongitude - sunPos.longitude;

    // Handle zodiac wrap-around (e.g., target 5, current 355 -> diff should be +10)
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.0001) break; // Within tolerance

    // Sun speed is approximately degrees per day
    const sunSpeed = sunPos.speedLongitude; // degrees per day
    jd += diff / sunSpeed;
  }

  return jd;
}


// ============================================================
// TYPE DETERMINATION
// ============================================================

function determineType(
  definedCenters: Set<string>,
  definedChannels: ChannelDef[]
): HDType {
  // No centers defined = Reflector
  if (definedCenters.size === 0) return 'Reflector';

  const sacralDefined = definedCenters.has('sacral');

  // Check for motor-to-throat path via BFS
  const motorToThroat = hasMotorToThroatPath(definedCenters, definedChannels);

  if (sacralDefined && motorToThroat) return 'Manifesting Generator';
  if (sacralDefined) return 'Generator';
  if (motorToThroat) return 'Manifestor';
  return 'Projector';
}

function hasMotorToThroatPath(
  definedCenters: Set<string>,
  channels: ChannelDef[]
): boolean {
  const motorCenters = ['heart', 'sacral', 'esp', 'root'];

  // Build adjacency list from defined channels
  const adj = new Map<string, Set<string>>();
  for (const ch of channels) {
    if (!adj.has(ch.center1)) adj.set(ch.center1, new Set());
    if (!adj.has(ch.center2)) adj.set(ch.center2, new Set());
    adj.get(ch.center1).add(ch.center2);
    adj.get(ch.center2).add(ch.center1);
  }

  // BFS from each defined motor center to throat
  for (const motor of motorCenters) {
    if (!definedCenters.has(motor)) continue;

    const visited = new Set<string>();
    const queue = [motor];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === 'throat') return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = adj.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
  }

  return false;
}


// ============================================================
// AUTHORITY DETERMINATION
// ============================================================

function determineAuthority(
  definedCenters: Set<string>,
  type: HDType
): string {
  if (type === 'Reflector') return 'Lunar';
  if (definedCenters.has('esp'))    return 'Emotional';   // Solar Plexus always wins
  if (definedCenters.has('sacral')) return 'Sacral';
  if (definedCenters.has('spleen')) return 'Splenic';
  if (definedCenters.has('heart'))  return 'Ego';
  if (definedCenters.has('g'))      return 'Self-Projected';
  // Only Head/Ajna/Throat defined = Mental Projector
  return 'Mental/Environmental';
}


// ============================================================
// DEFINITION TYPE (Connected Components)
// ============================================================

function determineDefinitionType(
  definedCenters: Set<string>,
  channels: ChannelDef[]
): string {
  if (definedCenters.size === 0) return 'No Definition';

  // Build adjacency list
  const adj = new Map<string, Set<string>>();
  for (const center of definedCenters) {
    adj.set(center, new Set());
  }
  for (const ch of channels) {
    adj.get(ch.center1)?.add(ch.center2);
    adj.get(ch.center2)?.add(ch.center1);
  }

  // Count connected components via BFS
  const visited = new Set<string>();
  let components = 0;

  for (const center of definedCenters) {
    if (visited.has(center)) continue;
    components++;

    const queue = [center];
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      for (const neighbor of adj.get(current) || new Set()) {
        if (!visited.has(neighbor) && definedCenters.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  switch (components) {
    case 1: return 'Single';
    case 2: return 'Split';
    case 3: return 'Triple Split';
    case 4: return 'Quadruple Split';
    default: return 'Unknown';
  }
}
```

### Line Sub-Structure (Color, Tone, Base)

For advanced implementations, each line has additional subdivisions:
- Each **line** contains 6 **colors**
- Each **color** contains 6 **tones**
- Each **tone** contains 5 **bases**

Total positions: 64 gates x 6 lines x 6 colors x 6 tones x 5 bases = 69,120 unique positions.

For the MVP, only gate and line are needed. Color/Tone/Base can be added later.

---

## Validation Strategy

Before deploying the Human Design calculator, validate results against established calculators:

1. **mybodygraph.com** (Jovian Archive official) -- Generate free charts to compare
2. **geneticmatrix.com** -- Cross-reference Type, Authority, Profile
3. **bodygraph.io** -- Verify gate activations and channels

Test with known celebrity birth data where HD charts are publicly documented.

---

## Key Warnings and Caveats

1. **The mandala offset matters.** If the longitudeToGate function has even a small degree offset error, gates near boundaries will be wrong. Validate thoroughly.

2. **The Design date must use solar arc, not simple subtraction.** Subtracting 88 days from the birth date will give an approximate but potentially incorrect Design date. The Sun's speed varies throughout the year.

3. **Earth and South Node are computed, not looked up.** Earth = Sun + 180 degrees. South Node = North Node + 180 degrees. Do not try to look these up in the ephemeris.

4. **Use TRUE node, not MEAN node.** Human Design specifically requires the true node calculation (`SE_TRUE_NODE`).

5. **Motor-to-Throat requires graph traversal.** A simple check of direct channels is insufficient. The path can go through intermediate centers.

6. **Channel definitions must be deduped.** Several sources list channels from both directions (e.g., 26-44 and 44-26). Store each channel only once.
