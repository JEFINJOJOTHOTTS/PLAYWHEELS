const Product = require('../../models/productModel')
const slugify = require('slugify')
const imageHelper = require('../imageHelper')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


//discountCalculation
function discountCalculation(price, discountPercentage) {
    return Math.round(price - (price * discountPercentage / 100))
}


//slugify
function slugFunction(name) {
    return slugify(name, {
        replacement: '_'
    })
}

module.exports = {

    //addProuct
    addProduct: (productData, Images) => {
        return new Promise(async (resolve, reject) => {
            try {
                let productIds = []

                if (Array.isArray(productData.Color)) {
                    for (let j = 0; j < productData.Color.length; j++) {
                        let slugContent = productData.Name + " " + productData.Color[j]
                        let Slug = slugFunction(slugContent)
                        let imageName = await imageHelper.saveImage(Images, j)
                        let DiscountedPrice = await discountCalculation(productData.Price[j], productData.Discount[j])
                        const product = new Product({
                            Name: productData.Name,
                            Manufacturer: productData.Manufacturer,
                            Category: productData.Category,
                            PowerTrain: productData.PowerTrain,
                            Slug,
                            SubCategory: productData.SubCategory,
                            Dimensions: [productData.Length, productData.Width, productData.Height],
                            Color: productData.Color[j],
                            DiscountedPrice: DiscountedPrice,
                            Price: productData.Price[j],
                            Stock: productData.Stock[j],
                            Discount: productData.Discount[j],
                            DiscountExpiry: productData.DiscountExpiry[j],
                            Description: productData.Description,

                            Images: imageName
                        })
                        let productDetail = await product.save();
                        productIds.push(productDetail._id)
                    }
                } else {

                    let imageName = await imageHelper.saveImage(Images, 0)
                    let slugContent = productData.Name + " " + productData.Color
                    let Slug = slugFunction(slugContent)
                    let DiscountedPrice = await discountCalculation(productData.Price, productData.Discount)

                    const product = new Product({
                        Name: productData.Name,
                        Manufacturer: productData.Manufacturer,
                        Slug,
                        PowerTrain: productData.PowerTrain,
                        DiscountedPrice: DiscountedPrice,
                        SubCategory: productData.SubCategory,
                        Dimensions: [productData.Length, productData.Width, productData.Height],
                        Color: productData.Color,
                        Price: productData.Price,
                        Stock: productData.Stock,
                        Discount: productData.Discount,
                        DiscountExpiry: productData.DiscountExpiry,
                        Description: productData.Description,

                        Images: imageName
                    })
                    let productDetail = await product.save();
                    productIds.push(productDetail._id)
                }
                console.log(productIds)
                productIds.forEach(async (id) => {
                    await Product.findByIdAndUpdate(id, {
                        $set: { ColorOption: productIds },
                    });
                })
                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }


        })
    },

    //getProducts
    getProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await Product.find()
                    .populate('SubCategory').populate('ColorOption') // Populate the 'SubCategory' field with category data

                //console.log(product)
                resolve(product)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },

    //get -editProduct 
    getProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                Product.findById(id).populate('SubCategory').populate('ColorOption').then((product) => {
                    console.log(".....................", product)
                    resolve(product)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },

    //listProduct -get
    listProduct: (id, status) => {
        return new Promise(async (resolve, reject) => {
            try {
                Product.findByIdAndUpdate(id, {
                    $set: {
                        isListed: status
                    }
                }).then(resolve())
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //post -editProduct 
    editProduct: (productData, Images) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ImagesArray = []
                // console.log("hhhhhhhhhhhhhhhhhhhh")
                if (await Images.Image1 && await Images.Image2) {
                    imageHelper.deleteImage(productData.existingImage1)
                    imageHelper.deleteImage(productData.existingImage2)
                    ImagesArray[0] = (await imageHelper.saveImage(Images.Image1, 0, 1))[0]
                    ImagesArray.push((await imageHelper.saveImage(Images.Image2, 0, 1))[0])
                    console.log(ImagesArray)
                    console.log(productData.id)
                    await Product.findByIdAndUpdate(productData.id, {
                        $set: {
                            Images: ImagesArray
                        }
                    })
                } else {
                    if (Images.Image1 && !Images.Image2) {
                        imageHelper.deleteImage(productData.existingImage1)
                        // console.log("kkkkkkkk")
                        let Image = await imageHelper.saveImage(Images.Image1, 0, 1)
                        await Product.findByIdAndUpdate(productData.id, {
                            $set: {
                                'Images.0': Image
                            }
                        })
                    }
                    if (Images.Image2 && !Images.Image1) {
                        imageHelper.deleteImage(productData.existingImage2)
                        let Image = await imageHelper.saveImage(Images.Image2, 0, 1)
                        await Product.findByIdAndUpdate(productData.id, {
                            $set: {
                                'Images.1': Image
                            }
                        })
                    }
                }
                //create slug
                let slugContent = productData.Name + " " + productData.Color
                let Slug = slugFunction(slugContent)
                let DiscountedPrice = await discountCalculation(productData.Price, productData.Discount)
                console.log(DiscountedPrice)
                Product.findByIdAndUpdate(productData.id, {
                    Name: productData.Name,
                    Manufacturer: productData.Manufacturer,
                    Slug,
                    PowerTrain: productData.PowerTrain,
                    DiscountedPrice: DiscountedPrice,
                    SubCategory: productData.SubCategory,
                    Dimensions: [productData.Length, productData.Width, productData.Height],
                    Color: productData.Color,
                    Price: productData.Price,
                    Stock: productData.Stock,
                    Discount: productData.Discount,
                    DiscountExpiry: productData.DiscountExpiry,
                    Description: productData.Description,
                    EditedDate: Date.now()
                }).then(() => { resolve() })

            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }


        })
    },

    //getShopProducts
    getShopProducts: (search, sortQuery,  page) => {
        return new Promise(async (resolve, reject) => {

            try {
                let sort = {}
                if (sortQuery == "low_high") {
                    sort = { Price: 1 }
                } else {
                    sort = { Price: -1 }

                }


                const currentPage = page;

                const pageSize = 12;
                const products = await Product.find(search)
                    .skip((currentPage - 1) * pageSize).sort(sort)
                    .limit(pageSize).populate('SubCategory');

                //console.log(product)
                resolve(products)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //stockUpdate
    stockUpdate: (cart) => {
        return new Promise(async (resolve, reject) => {
            try {
                cart.forEach(async (cartItem) => {
                    // console.log(cartItem.id)
                    const blah = await Product.updateOne({ _id: cartItem.id }, {
                        $inc: { Stock: - cartItem.Quantity }
                    });
                    console.log(blah)
                }
                )

                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //post - addNewColor
    addNewColor: (productData, Images) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("///////////mmmmmmm//////////", productData.id)
                let similarProduct = await Product.findById(productData.id)
                console.log("??///////////////????", similarProduct)
                productIds = similarProduct.ColorOption
                console.log(productIds)
                // let productIds = []
                // console.log("hhhhhhhhhhhhhhhhhhhh")
                // console.log(productData)
                let imageName = await imageHelper.saveImage(Images, 0)
                let slugContent = productData.Name + " " + productData.Color
                let Slug = slugFunction(slugContent)
                let DiscountedPrice = await discountCalculation(productData.Price, productData.Discount)

                const product = new Product({
                    Name: productData.Name,
                    Manufacturer: productData.Manufacturer,
                    Slug,
                    DiscountedPrice: DiscountedPrice,
                    PowerTrain: productData.PowerTrain,
                    SubCategory: productData.SubCategory,
                    Dimensions: [productData.Length, productData.Width, productData.Height],
                    Color: productData.Color,
                    Price: productData.Price,
                    Stock: productData.Stock,
                    Discount: productData.Discount,
                    DiscountExpiry: productData.DiscountExpiry,
                    Description: productData.Description,
                    ColorOption: productIds,
                    Images: imageName
                })
                let productDetail = await product.save();

                productIds.push(productDetail._id)
                console.log(productIds)


                productIds.forEach(async (id) => {
                    await await Product.findByIdAndUpdate(
                        id,
                        {
                            $push: { ColorOption: productDetail._id }
                        },
                    );
                })

                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //getAllColor
    getAllColor: () => {
        return new Promise(async (resolve, reject) => {
            try {
                Product.aggregate([
                    {
                        $match: {
                            isListed: true,
                            Stock: { $gt: 0 }
                        }
                    },
                    {
                        $group: {
                            _id: { $toUpper: "$Color" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            color: "$_id",
                            count: 1
                        }
                    }
                ])

                    .then((color) => {
                        resolve(color)
                    })

            }
            catch (err) {
                console.log("error   :  ", err.message)
                reject(err)
            }
        })
    },


    // newArrivals
    newArrivals: () => {
        return new Promise(async (resolve, reject) => {
            try {
                Product.find({
                    "isListed": true,
                    "Stock": { $gt: 0 }
                }).sort({ _id: -1 }).limit(8).then((products) => {
                    resolve(products)
                })
                    ;

            }
            catch (err) {
                console.log("error   : ", err.message)
                reject(err)
            }
        })
    },
    //getAllPowerTrain
    getAllPowerTrain: () => {
        return new Promise(async (resolve, reject) => {
            try {
                Product.aggregate([
                    {
                        $match: {
                            isListed: true,
                            Stock: { $gt: 0 }
                        }
                    },
                    {
                        $group: {
                            _id: { $toUpper: "$PowerTrain" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            powerTrain: "$_id",
                            count: 1
                        }
                    }
                ])

                    .then((powerTrain) => {
                        resolve(powerTrain)
                    })

            }
            catch (err) {
                console.log("error   :  ", err.message)
                reject(err)
            }
        })
    }

}


