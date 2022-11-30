/**
 * Prune input directories to filter subdirectories that share the same root directory.
 */
export const getRootDirectories = (inputDirectories: string[]): string[] => {
  const sortedDirectories = inputDirectories.sort((d1, d2) => d1.localeCompare(d2));
  const rootDirectories: string[] = [];
  for (const directory of sortedDirectories) {
    const isSubdirectory = rootDirectories.some((rootDirectory) => directory.startsWith(rootDirectory));
    if (!isSubdirectory) {
      rootDirectories.push(directory);
    }
  }
  return rootDirectories.sort((d1, d2) => d1.localeCompare(d2));
};
