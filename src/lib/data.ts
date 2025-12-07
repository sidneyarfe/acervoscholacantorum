import { Music, Calendar, Users, Headphones } from "lucide-react";

export interface Song {
  id: string;
  title: string;
  composer: string;
  arranger?: string;
  voicingType: "unison" | "polyphonic" | "gregorian";
  texture: "SATB" | "SA" | "TB" | "SAB" | "Uníssono";
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
  name: "Soprano" | "Contralto" | "Tenor" | "Baixo";
  abbreviation: "S" | "A" | "T" | "B";
  color: string;
  icon: typeof Music;
}

export const VOICE_PARTS: VoicePart[] = [
  { id: "soprano", name: "Soprano", abbreviation: "S", color: "rose", icon: Music },
  { id: "alto", name: "Contralto", abbreviation: "A", color: "rose", icon: Music },
  { id: "tenor", name: "Tenor", abbreviation: "T", color: "gold", icon: Music },
  { id: "bass", name: "Baixo", abbreviation: "B", color: "gold", icon: Music },
];

export const MOCK_SONGS: Song[] = [
  {
    id: "1",
    title: "Panis Angelicus",
    composer: "César Franck",
    arranger: "Arr. Schola Cantorum",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Comunhão", "Corpus Christi", "Eucarístico"],
    genre: "Hino",
    language: "Latim",
    hasScore: true,
    hasAudio: { soprano: true, alto: true, tenor: true, bass: true, full: true },
    celebrations: ["Corpus Christi", "Quinta-feira Santa"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Ave Maria",
    composer: "Franz Schubert",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Mariano", "Ofertório"],
    genre: "Moteto",
    language: "Latim",
    hasScore: true,
    hasAudio: { soprano: true, alto: true, tenor: false, bass: true, full: true },
    celebrations: ["Assunção de Maria", "Imaculada Conceição"],
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    title: "Kyrie Eleison (Missa de Angelis)",
    composer: "Canto Gregoriano",
    voicingType: "gregorian",
    texture: "Uníssono",
    liturgicalTags: ["Ordinário", "Kyrie"],
    genre: "Gregoriano",
    language: "Grego/Latim",
    hasScore: true,
    hasAudio: { soprano: false, alto: false, tenor: false, bass: false, full: true },
    celebrations: ["Tempo Comum", "Todas as Missas"],
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    title: "Adeste Fideles",
    composer: "John Francis Wade",
    arranger: "Arr. Tradicional",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Entrada", "Natal"],
    genre: "Hino",
    language: "Latim",
    hasScore: true,
    hasAudio: { soprano: true, alto: true, tenor: true, bass: true, full: true },
    celebrations: ["Natal", "Natividade"],
    createdAt: "2023-12-20",
  },
  {
    id: "5",
    title: "Salve Regina",
    composer: "Tradicional",
    voicingType: "gregorian",
    texture: "Uníssono",
    liturgicalTags: ["Mariano", "Saída"],
    genre: "Gregoriano",
    language: "Latim",
    hasScore: true,
    hasAudio: { soprano: false, alto: false, tenor: false, bass: false, full: true },
    celebrations: ["Festas Marianas", "Tempo Comum"],
    createdAt: "2024-03-01",
  },
  {
    id: "6",
    title: "O Salutaris Hostia",
    composer: "São Tomás de Aquino",
    arranger: "Arr. Pierre de la Rue",
    voicingType: "polyphonic",
    texture: "SATB",
    liturgicalTags: ["Eucarístico", "Bênção"],
    genre: "Moteto",
    language: "Latim",
    hasScore: true,
    hasAudio: { soprano: true, alto: false, tenor: true, bass: true, full: false },
    celebrations: ["Corpus Christi", "Adoração Eucarística"],
    createdAt: "2024-02-28",
  },
];

export const MOCK_CELEBRATIONS: Celebration[] = [
  {
    id: "1",
    name: "Corpus Christi",
    liturgicalRank: "solemnity",
    feastType: "Eucarístico",
    dateRule: "60 dias após a Páscoa",
    description: "Solenidade do Santíssimo Corpo e Sangue de Cristo",
  },
  {
    id: "2",
    name: "Natal do Senhor",
    liturgicalRank: "solemnity",
    feastType: "Temporal",
    dateRule: "25 de dezembro",
    description: "Natividade do Senhor",
  },
  {
    id: "3",
    name: "Assunção de Maria",
    liturgicalRank: "solemnity",
    feastType: "Mariano",
    dateRule: "15 de agosto",
    description: "Assunção da Bem-Aventurada Virgem Maria",
  },
  {
    id: "4",
    name: "Domingo de Páscoa",
    liturgicalRank: "solemnity",
    feastType: "Temporal",
    dateRule: "Variável",
    description: "Ressurreição do Senhor",
  },
];

export const LITURGICAL_SEASONS = [
  "Advento",
  "Natal",
  "Tempo Comum",
  "Quaresma",
  "Páscoa",
];

export const SONG_CATEGORIES = [
  "Entrada",
  "Kyrie",
  "Glória",
  "Salmo Responsorial",
  "Aclamação ao Evangelho",
  "Ofertório",
  "Santo",
  "Comunhão",
  "Saída",
];
