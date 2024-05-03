const path = require("path");

exports.uploadSingle = (req,fileKey,dest,max_mb=5,filesAllow=[".png",".jpg",".gif",".jpeg"]) => {
  return new Promise((resolve,reject) => {
    let myFile = req.files[fileKey];
    if(!myFile){
      reject({msg:"you need to send file",code:"send_file"})
    }
    if (myFile.size <= 1024 * 1024 * max_mb) {
      let extFile = path.extname(myFile.name)
      if (filesAllow.includes(extFile)) {
        dest = dest != "" ? dest : myFile.name
        myFile.mv("public/images/" + dest, (err) => {
          if (err) { return res.status(401).json({ msg: "error", err }) }
          resolve({ msg: "file upload" });
        })
      }
      else{
        reject({ msg: "File not allowed ",code:"ext" });
      }
    }
    else {
      reject({ msg: "File too big, max "+max_mb+" mb!",code:"max" });
    }
  })

}