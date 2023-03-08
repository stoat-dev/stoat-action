declare module 'convert-svg-to-png' {
  const convertFile: (svg: string, options?: { outputFilePath: string }) => Promise<void>;
}
