const sharp = require('sharp')
const fs = require('fs')


//fs module
function deleteImage(name) {
    fs.unlink('./public/product/' + name, (err) => { })
}


//image upload
async function saveImage(Images, j, k) {
    if (k == undefined) {
        k = 0
    }
    let imageName = []
    for (let i = j; i <= j + 1 - k; i++) {
        const originalFileName = Images[i].originalname;

        const fileExtension = originalFileName.split('.').pop(); // Extract file extension

        const imageBuffer = await sharp(Images[i].buffer)
            .resize({
                width: 500,
                height: 500,
                fit: "cover",
            })
            .toBuffer();


        const imagePath = `${Date.now()}.${fileExtension}`;
        await sharp(imageBuffer).toFile(`public/product/` + imagePath);
        imageName.push(imagePath)
    }
    return imageName
}


module.exports={
    deleteImage,
    saveImage
}
