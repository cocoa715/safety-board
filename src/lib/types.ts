export interface Notice {
  id: string;
  title: string;
  date: string;
  url: string;
  isNew?: boolean;
  isImportant?: boolean;
}

export interface NoticeResponse {
  success: boolean;
  data: Notice[];
  source: string;
  fetchedAt: string;
  error?: string;
}

export interface DataSource {
  key: string;
  label: string;
  subLabel: string;
  shortName: string;
  siteUrl: string;
  apiPath: string;
  linkText: string;
}
