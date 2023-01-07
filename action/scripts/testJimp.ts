import Jimp from 'jimp';

(async () => {
  const file = await Jimp.read('../docs/build/img/logo-128.png');
  await file.writeAsync('resized.png');
  console.log(`Image size: ${file.getWidth()} x ${file.getHeight()}`);
})();
