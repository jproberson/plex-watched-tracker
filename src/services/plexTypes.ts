export interface PlexDirectory {
  key: string;
  title: string;
  type: string;

  [key: string]: unknown;
}

export interface PlexMediaContainer {
  size: number;
  allowSync: boolean;
  title1: string;
  Directory: PlexDirectory[];
}

export interface PlexSectionsResponse {
  MediaContainer: PlexMediaContainer;
}

export interface PlexMetadata {
  title: string;
  key: string;
  thumb?: string;
  genres?: Array<{ tag: string }>;
  countries?: Array<{ tag: string }>;

  [key: string]: unknown;
}

export interface PlexShowResponse {
  MediaContainer: {
    Metadata: PlexMetadata[];
  };
}

export interface PlexSeasonResponse {
  MediaContainer: {
    Metadata: PlexMetadata[];
  };
}

export interface GenreMetaData {
  tag: string;
}

export interface CountryMetaData {
  tag: string;
}

export interface RoleMetaData {
  tag: string;
}

export interface ShowMetaData {
  ratingKey: string;
  key: string;
  guid: string;
  slug: string;
  studio: string;
  type: string;
  title: string;
  titleSort: string;
  contentRating: string;
  summary: string;
  index: number;
  audienceRating: number;
  year: number;
  tagline: string;
  thumb: string;
  art: string;
  theme: string;
  duration: number;
  originallyAvailableAt: string;
  leafCount: number;
  viewedLeafCount: number;
  childCount: number;
  addedAt: number;
  updatedAt: number;
  audienceRatingImage: string;
  primaryExtraKey: string;
  Genre: GenreMetaData[];
  Country: CountryMetaData[];
  Role: RoleMetaData[];
}

export interface ShowTrackerData {
  title: string;
  genres: string[];
  country: string;
  thumbnail: string;
  numberOrder?: string,
  letterOrder?: string
}