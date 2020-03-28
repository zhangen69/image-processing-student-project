// const jimp = require('jimp');
const configure = require('@jimp/custom');
const circle = require('@jimp/plugin-circle');
const shadow = require('@jimp/plugin-shadow');
const fisheye = require('@jimp/plugin-fisheye');
const threshold = require('@jimp/plugin-threshold');
const jimp = configure({ plugins: [circle, shadow, fisheye, threshold] });

exports.readImage = async (image_path) => {
  let error_message = null;
  let image;
  let succeeded = false;

  try {
    image = await jimp.read(image_path);
    succeeded = true;
  } catch (error) {
    error_message = error;
  }

  return { succeeded, image, error_message };
}

exports.resizeImage = async (image, width, height, mode) => {
  width = width === 'auto' ? jimp.AUTO : width;
  height = height === 'auto' ? jimp.AUTO : height;

  if (!!mode) {
    await image.resize(width, height, mode);
  } else {
    await image.resize(width, height);
  }
}

exports.writeImage = async (image, filePath) => {
  await image.writeAsync(`${filePath}`);
}

exports.blitImage = async (image, blitImage, { x, y }) => {
  await image.blit(blitImage, x, y);
}

exports.blurImage = async (image, blurLevel = 0) => {
  await image.blur(blurLevel);
}

exports.manipulateImageColor = async (image, settings) => {
  // adjust image color
  await image.color([
    // { apply: 'hue', params: [-90] }, // degree
    // { apply: 'lighten', params: [10] }, // amount
    // { apply: 'xor', params: ['#06D'] } // color
    // { apply: 'red', params: [100] } // amount
    // { apply: 'green', params: [100] } // amount
    // { apply: 'blue', params: [100] } // amount
    // { apply: 'shade', params: [100] } // amount
    // { apply: 'tint', params: [100] } // amount
    // { apply: 'mix', params: ['#06D', 100] } // color, amount
    // { apply: 'spin', params: [100] } // degree
    // { apply: 'greyscale', params: [100] } // amount
    // { apply: 'saturate', params: [100] } // amount
    // { apply: 'desaturate', params: [100] } // amount
    // { apply: 'darken', params: [100] } // amount
    { apply: 'brighten', params: [30] } // amount
  ]);
}

exports.containImage = async (image) => {
  // create a box put image inside
  await image.contain(1500, 700);
}

exports.setImageCover = async (image, width, height) => {
  await image.cover(width, height);
}

exports.displaceImage = async (image) => {
  await image.displace(image, 10);
}

exports.ditherImage = async (image) => {
  await image.dither565();
}

exports.flipImage = async (image, flipHorizontal = true, flipVertical = false) => {
  await image.flip(flipHorizontal, flipVertical);
}

exports.gaussianBlurImage = async (image, blurLevel = 0) => {
  await image.gaussian(blurLevel);
}

exports.invertImageColor = async (image) => {
  await image.invert();
}

exports.maskImage = async (image, maskImage) => {
  this.resizeImage(maskImage, jimp.AUTO, image.getHeight());
  await image.mask(maskImage);
}

exports.normalizeImage = async (image) => {
  await image.normalize();
}

exports.printText = async (image, { text, x = 0, y = 0, horizontal = jimp.HORIZONTAL_ALIGN_CENTER, vertical = jimp.VERTICAL_ALIGN_MIDDLE, font = FONT_SANS_32_BLACK }) => {
  const fontBitmap = await jimp.loadFont(font);
  await image.print(fontBitmap, x, y, text);
}

exports.rotateImage = async (image, rotateDegree = 0) => {
  await image.rotate(rotateDegree);
}

exports.scaleImage = async (image, scaleFactor = 1) => {
  await image.scale(scaleFactor, jimp.RESIZE_BEZIER);
}

exports.scaleToFitImage = async (image, width, height) => {
  await image.scaleToFit(width, height);
}

exports.circleImage = async (image, radius) => {
  await image.circle();
}

exports.shadowImage = async (image) => {
  await image.shadow();
}

exports.fisheyeImage = async (image, level = 2) => {
  await image.fisheye({ r: level });
}

exports.thresholdImage = async (image, max = 150) => {
  await image.threshold({ max });
}

exports.opacityImage = async (image, opacityLevel = 0.5) => {
  await image.opacity(opacityLevel);
}

exports.greyscaleImage = async (image) => {
  await image.greyscale();
  // await image.color([
  //   { apply: 'greyscale', params: [100] } // amount
  // ]);
}

exports.compositeImage = async (image, watermarkImage) => {
  await image.composite(watermarkImage, 0, 0, {
    mode: jimp.BLEND_SOURCE_OVER,
    opacityDest: 1,
    opacitySource: 0.5
  });
}

exports.posterizeImage = async (image, level = 1) => {
  await image.posterize(level);
}

exports.sepiaImage = async (image) => {
  await image.sepia();
}

exports.fadeImage = async (image, fadeLevel = 0.5) => {
  await image.fade(fadeLevel);
}

exports.pixelateImage = async (image, size = 5, { width = image.getWidth(), height = image.getHeight(), x = 0, y = 0 }) => {
  await image.pixelate(size, x, y, width, height);
}

exports.contrastImage = async (image, contrastLevel = 0.4) => {
  await image.contrast(contrastLevel);
}

exports.getBuffer = async (image) => {
  return await image.getBufferAsync(image.getExtension());
}

exports.getDataURI = async (image) => {
  return await image.getBase64Async(image.getExtension());
}
