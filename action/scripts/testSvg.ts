// @ts-ignore
import { convertFile } from 'convert-svg-to-png';
// @ts-ignore
import fs from 'fs';

const path = '../docs/static/img/examples/jacoco-logo.svg';

(async () => {
  await convertFile(path);
})();
