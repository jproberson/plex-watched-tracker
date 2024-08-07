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

export interface PlexSectionData {
  MediaContainer: {
    size: number;
    allowSync: boolean;
    title1: string;
    Directory: PlexDirectory[];
    art: string;
    thumb: string;
    content: string;
    identifier: string;
    librarySectionID: number;
    librarySectionTitle: string;
    librarySectionUUID: string;
    mediaTagPrefix: string;
    mediaTagVersion: number;
    nocache: boolean;
    viewGroup: string;
    Metadata: ShowMetaData[];
  };

}

export interface PlexSections {
  MediaContainer: {
    size: number;
    allowSync: boolean;
    title1: string;
    Directory: PlexDirectory[];
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
  thumb: string;
  numberOrder?: number,
  letterOrder?: string
}