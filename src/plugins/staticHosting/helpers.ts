import crypto from 'crypto';

export const getHash = (input: string): string => {
  if (input === '') {
    return '-';
  }
  return crypto.createHash('md5').update(input).digest('hex');
};

export const getUniqueToken = (input: string, totalLength: number, maxHashLength: number): string => {
  if (maxHashLength + 1 >= totalLength) {
    throw new Error('maxHashLength must be less than totalLength - 1');
  }
  const token = input
    .replace(/[^a-zA-Z0-9]/g, '-')
    // merge multiple dashes because double-dash is used as path separators
    .replace(/-{2,}/g, '-')
    // remove leading and trailing dashes
    .replace(/^-+/g, '')
    .replace(/-+$/, '')
    .toLowerCase();
  if (token.length <= totalLength) {
    return token;
  }
  const hash = getHash(token).slice(0, maxHashLength);
  // merge multiple dashes after truncation
  return `${token.slice(0, totalLength - hash.length - 1)}-${hash}`.replace(/-{2,}/g, '-');
};

export const getUploadSubdomain = (owner: string, repo: string, ghSha: string, pluginId: string): string => {
  const ownerToken = getUniqueToken(owner, 15, 5);
  const repoToken = getUniqueToken(repo, 15, 5);
  const shaToken = ghSha.slice(0, 7);
  const pluginIdToken = getUniqueToken(pluginId, 10, 4);
  return `${ownerToken}--${repoToken}--${shaToken}--${pluginIdToken}`;
};
