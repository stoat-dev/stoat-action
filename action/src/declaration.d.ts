declare module 'convert-svg-to-png' {
  const convertFile: (
    svg: string,
    options?: { outputFilePath?: string; width?: number; height?: number }
  ) => Promise<void>;
}
