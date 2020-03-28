const imageProcess = require('./image_process');

const output_path = './images/output.png';
const image_path = './images/cat-1.jpg';
// const image_path = './images/avatar-1.png';
// const image_path = './images/normalize-1.jpg';
const blitImage_path = './images/blit-demo.png';
const maskImage_path = './images/mask-1.png';
// const maskImage_path = './images/mask-2.png';
 
imageProcess.readImage(image_path).then(async (image_result) => {
  if (!image_result.succeeded) {
    console.error(image_result.error_message);
    return;
  }
  const image = image_result.image;
  const blitImage = (await imageProcess.readImage(blitImage_path)).image;
  const maskImage = (await imageProcess.readImage(maskImage_path)).image;
  // resize blitImage
  await imageProcess.resizeImage(blitImage, 'auto', 200);
  // await resizeImage(image, 'auto', 1000);
  // await imageProcess.blurImage(image, 5);
  // await imageProcess.manipulateImageColor(image);
  // await imageProcess.containImage(image);
  // await imageProcess.setImageCover(image);
  // await imageProcess.displaceImage(image);
  // await imageProcess.ditherImage(image);
  // await imageProcess.flipImage(image);
  // await imageProcess.gaussianBlurImage(image, 15);
  // await imageProcess.invertImageColor(image);
  // await imageProcess.maskImage(image, maskImage);
  // await imageProcess.blitImage(image, blitImage, { x: 0, y: 100 });
  // await imageProcess.normalizeImage(image);
  // await imageProcess.normalizeImage(image);
  // await imageProcess.printText(image, { text: 'WANTED CAT', x: 10, y: 100, font: jimp.FONT_SANS_32_BLACK });
  // await imageProcess.scaleImage(image, 5);
  // await imageProcess.scaleToFitImage(image, 500, 500);
  // await imageProcess.circleImage(image);
  // await imageProcess.shadowImage(image);
  // await imageProcess.circleImage(image);
  // await imageProcess.fisheyeImage(image, 1.8);
  await imageProcess.thresholdImage(image);
  await imageProcess.writeImage(image, output_path);
});

