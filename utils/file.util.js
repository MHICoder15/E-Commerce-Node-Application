const fs = require("fs");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      return new Error("Delete File", err);
    }
  });
};

exports.deleteFile = deleteFile;
