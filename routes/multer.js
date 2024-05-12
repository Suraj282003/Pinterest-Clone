const multer = require('multer');
const path = require('path')
const { v4: uudiv4 } = require('uuid')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniquefile = uudiv4();
    cb(null, uniquefile+path.extname(file.originalname)); //Appending extension
  }
})

const upload = multer({ storage: storage });

module.exports = upload;