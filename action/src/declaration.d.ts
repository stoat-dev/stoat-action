declare module 'oslllo-svg2' {
  class Svg2Class {
    constructor(file: string);

    png(): {
      toFile(file: string): Promise<void>;
    };
  }

  const Svg2: (file: string) => Svg2Class;
  export = Svg2;
}
