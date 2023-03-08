// @ts-ignore
import { convertFile } from 'convert-svg-to-png';
import { XMLParser } from 'fast-xml-parser';
// @ts-ignore
import fs from 'fs';

const path = '../docs/static/img/examples/jest-logo.svg';

(async () => {
  const svg = fs.readFileSync(path, 'utf8');
  const parser = new XMLParser({ ignoreAttributes: false });
  const svgObject = parser.parse(svg);
  const viewBox: string = String(svgObject.svg['@_viewBox']);
  const [, , width, height] = viewBox.split(' ').map((value: string) => parseInt(value, 10));
  console.log(`Image size: ${width} x ${height}`);
  await convertFile(path, { outputFilePath: 'test.png', width, height });
})();
