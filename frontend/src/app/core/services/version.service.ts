import { get } from './api.service';

type VersionInfo = {
  version: string;
  buildDate: string;
  commitHash: string;
};

export const versionService = {
  get: () => get<VersionInfo>('/version'),
};
