import Jimp from 'jimp';

(async () => {
  await Jimp.read('../docs/build/img/logo-128.png', (error, image) => {
    if (error) {
      console.error(`Error reading image: ${error}`);
      throw error;
    }
    image.resize(32, 32).write('resize-logo-32.png');
  });
})();
