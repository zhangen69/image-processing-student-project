const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
// const configure = require('@jimp/custom');
// const circle = require('@jimp/plugin-circle');
// const shadow = require('@jimp/plugin-shadow');
// const fisheye = require('@jimp/plugin-fisheye');
// const threshold = require('@jimp/plugin-threshold');
// const Jimp = configure({ plugins: [circle, shadow, fisheye, threshold] });
const Jimp = require('jimp');

const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();
// router setting
app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors({ origin: true, methods: 'POST', credentials: true }));

const getBuffer = (image) => {
  const url = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(url, 'base64');
  return buffer;
};

router.post('/resize', async (req, res) => {
  const { width, height } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.resize(width, height);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/sepia', async (req, res) => {
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.sepia();
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/blur', async (req, res) => {
  const { level } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.blur(level);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/posterize', async (req, res) => {
  const { level } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.posterize(level);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/background', async (req, res) => {
  const { color } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    const hexdecimal = Number('0x' + color + '00').toString(16);
    image.background(0xFFFFFFFF);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/opacity', async (req, res) => {
  const { level } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.opacity(level);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/contrast', async (req, res) => {
  const { level } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.contrast(level);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/crop', async (req, res) => {
  const { x, y, w, h } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.crop(x, y, w, h);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/convolute', async (req, res) => {
  const { type } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    // default is lowpass matrix
    let matrix = [
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9],
    ];
    if (type === 'highpass') {
      matrix = [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1],
      ]
    } else if (type === 'directional') {
      matrix = [
        [-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1],
      ]
    } else if (type === 'laplacian') {
      matrix = [
        [0, -1, 0],
        [-1, 4, 1],
        [0, -1, 0],
      ]
    }
    image.convolute(matrix);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/scale', async (req, res) => {
  const { level } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.scale(level);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/rotate', async (req, res) => {
  const { degree } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.rotate(degree, false);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/flip', async (req, res) => {
  const { flipHorizontal, flipVertical } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.flip(flipHorizontal, flipVertical);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/printText', async (req, res) => {
  const { font, text, x, y } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    const fontBitmap = await Jimp.loadFont(Jimp[font]);
    image.print(fontBitmap, x, y, text);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/greyscale', async (req, res) => {
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.greyscale();
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/invert', async (req, res) => {
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.invert();
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

// router.post('/circle', async (req, res) => {
//   const buffer = getBuffer(req.body.image);
//   try {
//     const image = await Jimp.read(buffer);
//     image.circle();
//     const output = await image.getBase64Async(Jimp.AUTO);
//     res.status(200).json({ code: 0, image: output });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

app.use('/api/image', router);
app.use('/', express.static(path.join(__dirname, './public')));
router.use((req, res, next) => {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Listenning on: http://localhost:${port}`);
});
