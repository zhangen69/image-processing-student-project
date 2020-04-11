const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
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
  const { mode, x, y, w, h } = req.body.options;
  const buffer = getBuffer(req.body.image);
  try {
    const image = await Jimp.read(buffer);
    image.autocrop();
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

app.listen(port, () => {
  console.log(`Listenning on: http://localhost:${port}`);
});
