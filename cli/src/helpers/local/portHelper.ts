import chalk from 'chalk';
import portfinder from 'portfinder';

// s+t+o+a+t = 19+20+15+1+20 = 75
export const DEFAULT_PORT = 8075;

export async function getPort(optionsPort: any) {
  let port: number | undefined;

  if (optionsPort) {
    port = Number(optionsPort);

    if (isNaN(port) || port < 0 || port >= 65536) {
      console.error(chalk.red(`Requested port ${optionsPort} is invalid!`));
      process.exit(1);
    }

    let portAvailable;
    await portfinder
      .getPortPromise({ port: port, stopPort: port })
      .then(() => {
        portAvailable = true;
      })
      .catch(() => {
        portAvailable = false;
      });
    if (!portAvailable) {
      console.error(chalk.red(`Requested port ${port} is already taken!`));
      process.exit(1);
    }
  } else {
    return await portfinder.getPortPromise({ port: DEFAULT_PORT });
  }
}
