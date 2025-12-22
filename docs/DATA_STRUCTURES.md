# VJSS App - Data Structures Documentation

## Table of Contents
1. [City Data](#city-data)
2. [Tap/Aaradhana Data](#tapaaradhana-data)
3. [Tirthankars Data](#tirthankars-data)
4. [Pachhakkhan Data](#pachhakkhan-data)
5. [About Screen Data](#about-screen-data)
6. [FAQ Data](#faq-data)
7. [Common Patterns](#common-patterns)
   - [Language Support](#language-support)
   - [Audio Files](#audio-files)
   - [Icons](#icons)
8. [Data Storage](#data-storage)
9. [Internationalization](#internationalization)

## City Data

### Structure
```typescript
interface City {
  id: string;
  name: string;        // "City, State, Country"
  timezone: string;    // IANA timezone (e.g., "Asia/Kolkata")
  lat: number;         // Latitude
  long: number;        // Longitude
}
```

### Example
```json
{
  "id": "1",
  "name": "Ahmedabad, Gujarat, India",
  "timezone": "Asia/Kolkata",
  "lat": 23.03,
  "long": 72.58
}
```

## Tap/Aaradhana Data

### Structure
```typescript
interface TapAaradhanaItem {
  id: string;
  tapName: string;
  tapDetail: string;
  pachkkhan: string[];
  icon: string;        // Icon name (compatible with react-native-vector-icons)
  color: string;       // Hex color code
  [key: string]: any;  // Additional tap-specific data
}
```

### Example
```json
{
  "id": "1",
  "tapName": "Ekasanu",
  "tapDetail": "In Ekasanu, Eat only once in a day...",
  "pachkkhan": ["ekasanu", "panhar"],
  "icon": "restaurant",
  "color": "#4CAF50",
  "ekasanu": {
    "gujarati": "ઉગ્ગએ સૂરે...",
    "hindi": "उग्गए सूरे...",
    "english": "Uggae Sure...",
    "detail": "Ekasanu: Eat only once in a day...",
    "audio": "4. Ekasanu_Biyasanu Pachhakkhan_Audio"
  }
}
```

## Tirthankars Data

### Structure
```typescript
interface Tirthankar {
  id: string;
  name: string;
  color: string;       // Hex color code
  birthNakshatra: string;
  birthDate: string;   // Format: "Month DD" (e.g., "Chaitra Sud 13")
  birthPlace: string;
  fatherName: string;
  motherName: string;
  height: string;      // In feet/inches or other units
  lifespan: string;    // E.g., "72 years"
  symbol: string;      // Symbol/emblem
  details: {
    [language: string]: string;  // Language code to details mapping
  };
}
```

### Example
```json
{
  "id": "1",
  "name": "Lord Rishabhdev",
  "color": "#FF9800",
  "birthNakshatra": "Uttara Bhadrapada",
  "birthDate": "Chaitra Sud 9",
  "birthPlace": "Ayodhya",
  "fatherName": "King Nabhi",
  "motherName": "Queen Marudevi",
  "height": "500 Dhanush",
  "lifespan": "84 lakh purva",
  "symbol": "Bull",
  "details": {
    "en": "First Tirthankara of present Avasarpini...",
    "gu": "વર્તમાન અવસર્પિણીના પહેલા તીર્થંકર..."
  }
}
```

## Pachhakkhan Data

### Structure
```typescript
interface PachhakkhanItem {
  id: string;
  title: string;
  description: string;
  audio: string;       // Audio file name
  type: 'pachhakkhan' | 'tap';
  details: {
    [language: string]: {
      text: string;
      audio: string;   // Language-specific audio if available
    }
  };
}
```

### Example
```json
{
  "id": "1",
  "title": "Pachhakkhan 1",
  "description": "Description of the pachhakkhan...",
  "audio": "pachhakkhan_1.mp3",
  "type": "pachhakkhan",
  "details": {
    "en": {
      "text": "English translation...",
      "audio": "pachhakkhan_1_en.mp3"
    },
    "gu": {
      "text": "Gujarati translation...",
      "audio": "pachhakkhan_1_gu.mp3"
    }
  }
}
```

## About Screen Data

### Structure
```typescript
interface AboutContent {
  title: string;
  version: string;
  description: {
    [language: string]: string;
  };
  developer: {
    name: string;
    email: string;
    website: string;
  };
  acknowledgements: {
    [language: string]: string[];
  };
}
```

### Example
```json
{
  "title": "VJSS App",
  "version": "1.0.0",
  "description": {
    "en": "Vibrant Jain Spiritual Services...",
    "gu": "વાઈબ્રન્ટ જૈન સ્પિરિચ્યુઅલ સર્વિસીસ..."
  },
  "developer": {
    "name": "VJSS Team",
    "email": "contact@vjss.org",
    "website": "https://vjss.org"
  },
  "acknowledgements": {
    "en": [
      "Special thanks to all the scholars...",
      "Icons by Icons8..."
    ]
  }
}
```

## FAQ Data

### Structure
```typescript
interface FAQItem {
  id: string;
  question: {
    [language: string]: string;
  };
  answer: {
    [language: string]: string;
  };
  category?: string;    // Optional category for grouping
}
```

### Example
```json
{
  "id": "1",
  "question": {
    "en": "What is Ekasanu?",
    "gu": "એકાસણુ શું છે?"
  },
  "answer": {
    "en": "Ekasanu is a type of austerity where...",
    "gu": "એકાસણુ એક પ્રકારની તપસ્યા છે જેમાં..."
  },
  "category": "tap"
}
```

## Common Patterns

### Language Support
All text content follows this pattern for multi-language support:

```typescript
{
  "en": "English text",
  "gu": "ગુજરાતી લખાણ",
  "hi": "हिंदी पाठ"
}
```

### Audio Files
- Audio files are referenced by name (without path/extension)
- Should be stored in the app's assets/audio directory
- Naming convention: `[feature]_[id]_[language].mp3` (e.g., `pachhakkhan_1_en.mp3`)

### Icons
- Uses `react-native-vector-icons`
- Icon names should be from the supported icon sets
- Common icon sets: MaterialIcons, Ionicons, FontAwesome

## Data Storage
- **Local Storage**: Uses `@react-native-async-storage/async-storage`
- **City Selection**: Saves selected city data in AsyncStorage with key `selectedCityData`
- **Language Preference**: Saves selected language with key `userLanguage`

## Internationalization
- Uses `i18n-js` for internationalization
- Translation files are stored in `/src/i18n/`
- File naming: `[language-code].json` (e.g., `en.json`, `gu.json`)
- Each translation file should have all the keys for that language

## Best Practices
1. Always include all required fields in JSON objects
2. Keep language files in sync across all translations
3. Use consistent naming conventions for audio files
4. Validate JSON data before using it in the app
5. Document any new data structures added to the app

## Version History
- 1.0.0 (2025-12-19): Initial documentation
