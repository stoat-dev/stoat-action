import * as core from '@actions/core';

import { createSignedUrl, submitPartialConfig, uploadDirectory } from '../plugins/staticHosting/helpers';

/**
 * Upload a directory for hosting, and submit a partial config.
 */
export const processDirectory = async (
  ghOwner: string,
  ghRepo: string,
  ghSha: string,
  ghToken: string,
  stoatConfigFileId: number,
  taskId: string,
  pathToUpload: string
): Promise<void> => {
  // get signed url
  const { signedUrl, fields, objectPath, hostingUrl } = await createSignedUrl({
    ghOwner,
    ghRepo,
    ghSha,
    ghToken,
    taskId
  });

  // upload directory
  core.info(`[${taskId}] Uploading ${pathToUpload} to ${objectPath}...`);
  await uploadDirectory(signedUrl, fields, pathToUpload, objectPath);

  // submit partial config
  await submitPartialConfig(taskId, ghSha, ghToken, hostingUrl, stoatConfigFileId);
};
