const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();
// router setting
router.use(helmet());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cors());

router.post('/resize', async (req, res) => {
  res.status(200).json(req.body);
});

app.use('/api/image', router)

app.listen(port, () => {
  console.log(`Listenning on: http://localhost:${port}`);
})
