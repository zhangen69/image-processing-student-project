const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const imageProcess = require('./image_process');
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
router.use(helmet());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cors());

router.post('/resize', async (req, res) => {
  const { width, height } = req.body.options;
  const url = req.body.image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(url, 'base64');
  try {
    const image = await Jimp.read(buffer); // imageProcess.readImage(buffer);
    await image.resize(width, height);
    const output = await image.getBase64Async(Jimp.AUTO);
    res.status(200).json({ code: 0, image: output });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.use('/api/image', router);

app.listen(port, () => {
  console.log(`Listenning on: http://localhost:${port}`);
});
