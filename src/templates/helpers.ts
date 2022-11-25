import { readFileSync } from 'fs';

import { StoatConfigSchema } from '../schemas/stoatConfigSchema';

export const getTemplate = (stoatConfig: StoatConfigSchema): string => {
  const { comment_template } = stoatConfig;
  if (comment_template === '') {
    throw new Error(`Comment template is missing in the stoat config`);
  }

  return readFileSync(comment_template, 'utf8').toString().trim();
};
