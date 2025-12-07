import { Music, Calendar, Users, Headphones } from "lucide-react";

export interface Song {
  id: string;
  title: string;
  composer: string;
  arranger?: string;
  voicingType: "unison" | "polyphonic" | "gregorian";
  texture: "SATB" | "SA" | "TB" | "SAB" | "Unison";
  liturgicalTags: string[];
  genre: string;
  language: string;
  hasScore: boolean;
  hasAudio: {
    soprano: boolean;
    alto: boolean;
    tenor: boolean;
    bass: boolean;
    full: boolean;
  };
  celebrations: string[];
  createdAt: string;
}

export interface Celebration {
  id: string;
  name: string;
  liturgicalRank: "solemnity" | "feast" | "memorial" | "optional" | "ordinary";
  feastType: string;
  dateRule: string;
  description: string;
}

export interface VoicePart {
  id: string;
  name: "Soprano" | "Alto" | "Tenor" | "Bass";
  abbreviation: "S" | "A" | "T" | "B";
  color: string;
  icon: typeof Music;
}

export const VOICE_PARTS: VoicePart[] = [
  { id: "soprano", name: "Soprano", abbreviation: "S", color: "rose", icon: Music },
  { id: "alto", name: "Alto", abbreviation: "A", color: "rose", icon: Music },
  { id: "tenor", name: "Tenor", abbreviation: "T", color: "gold", icon: Music },
  { id: "bass", name: "Bass", abbreviation: "B", color: "gold", icon: Music },
];

export const MOCK_SONGS: Song[] = [
  {
    id: "1",
    title: "Panis Angelicus",
    composer: "César Franck",
    arranger: "Arr. Schola Cantorum",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Communion", "Corpus Christi", "Eucharistic"],
    genre: "Hymn",
    language: "Latin",
    hasScore: true,
    hasAudio: { soprano: true, alto: true, tenor: true, bass: true, full: true },
    celebrations: ["Corpus Christi", "Holy Thursday"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Ave Maria",
    composer: "Franz Schubert",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Marian", "Offertory"],
    genre: "Motet",
    language: "Latin",
    hasScore: true,
    hasAudio: { soprano: true, alto: true, tenor: false, bass: true, full: true },
    celebrations: ["Assumption of Mary", "Immaculate Conception"],
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    title: "Kyrie Eleison (Missa de Angelis)",
    composer: "Gregorian Chant",
    voicingType: "gregorian",
    texture: "Unison",
    liturgicalTags: ["Ordinary", "Kyrie"],
    genre: "Gregorian",
    language: "Greek/Latin",
    hasScore: true,
    hasAudio: { soprano: false, alto: false, tenor: false, bass: false, full: true },
    celebrations: ["Ordinary Time", "All Masses"],
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    title: "Adeste Fideles",
    composer: "John Francis Wade",
    arranger: "Arr. Tradicional",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Entrance", "Christmas"],
    genre: "Hymn",
    language: "Latin",
    hasScore: true,
    hasAudio: { soprano: true, alto: true, tenor: true, bass: true, full: true },
    celebrations: ["Christmas", "Nativity"],
    createdAt: "2023-12-20",
  },
  {
    id: "5",
    title: "Salve Regina",
    composer: "Traditional",
    voicingType: "gregorian",
    texture: "Unison",
    liturgicalTags: ["Marian", "Recessional"],
    genre: "Gregorian",
    language: "Latin",
    hasScore: true,
    hasAudio: { soprano: false, alto: false, tenor: false, bass: false, full: true },
    celebrations: ["Marian Feasts", "Ordinary Time"],
    createdAt: "2024-03-01",
  },
  {
    id: "6",
    title: "O Salutaris Hostia",
    composer: "Thomas Aquinas",
    arranger: "Arr. Pierre de la Rue",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Eucharistic", "Benediction"],
    genre: "Motet",
    language: "Latin",
    hasScore: true,
    hasAudio: { soprano: true, alto: false, tenor: true, bass: true, full: false },
    celebrations: ["Corpus Christi", "Eucharistic Adoration"],
    createdAt: "2024-02-28",
  },
];

export const MOCK_CELEBRATIONS: Celebration[] = [
  {
    id: "1",
    name: "Corpus Christi",
    liturgicalRank: "solemnity",
    feastType: "Eucharistic",
    dateRule: "60 days after Easter",
    description: "Solemnity of the Most Holy Body and Blood of Christ",
  },
  {
    id: "2",
    name: "Christmas",
    liturgicalRank: "solemnity",
    feastType: "Temporal",
    dateRule: "December 25",
    description: "Nativity of the Lord",
  },
  {
    id: "3",
    name: "Assumption of Mary",
    liturgicalRank: "solemnity",
    feastType: "Marian",
    dateRule: "August 15",
    description: "Assumption of the Blessed Virgin Mary",
  },
  {
    id: "4",
    name: "Easter Sunday",
    liturgicalRank: "solemnity",
    feastType: "Temporal",
    dateRule: "Variable",
    description: "Resurrection of the Lord",
  },
];

export const LITURGICAL_SEASONS = [
  "Advent",
  "Christmas",
  "Ordinary Time",
  "Lent",
  "Easter",
];

export const SONG_CATEGORIES = [
  "Entrance",
  "Kyrie",
  "Gloria",
  "Responsorial Psalm",
  "Gospel Acclamation",
  "Offertory",
  "Sanctus",
  "Communion",
  "Recessional",
];
