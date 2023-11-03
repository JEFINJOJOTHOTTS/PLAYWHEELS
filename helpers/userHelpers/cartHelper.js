
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const Cart = require('../../models/cartModel');
const Wishlist = require('../../models/wishlistModel');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = {

    //addToCart
    addToCart: async (proId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                const product = await Product.findOne({ _id: proId })

                const itemObjectId = new ObjectId(proId);

                let proObj = {
                    ProductId: itemObjectId,
                    Quantity: 1, // Use Quantity instead of quantity
                };


                let userCart = await Cart.findOne({ User: userId });

                if (userCart) {
                    console.log("Existing Cart:", userCart);
                    let itemIndex = userCart.Items.findIndex(item => item.ProductId.equals(itemObjectId));
                   
                    if (itemIndex !== -1) {
                        await Cart.updateOne(
                            { User: userId, 'Items.ProductId': itemObjectId },
                            {
                                $inc: { 'Items.$.Quantity': 1 }
                            }
                        );
                    } else {
                        await Cart.updateOne(
                            { User: userId },
                            {
                                $push: { Items: proObj }
                            }
                        );
                    }
                } else {
                    console.log("User Doesn't Have a Cart. Creating New Cart...");
                    await Cart.create(
                        {
                            User: userId,
                            Items: [proObj]
                        }
                    );
                }
                console.log("/////////><><><><><>/////////")
                // Resolve after the operation is complete
                resolve();
            } catch (error) {
                // Handle errors here
                console.error("Error in addToCart:", error);
                reject(error);

            }


        })
    }
    ,


    //getCartProduct
    getCartProduct: async (userId) => {
        return new Promise(async (resolve, reject) => {

            try {
                // console.log(userId)
                const cartPromise = Cart.aggregate([
                    {
                        $match: { User: userId }
                    },
                    {
                        $unwind: "$Items"
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "Items.ProductId",
                            foreignField: "_id",
                            as: "Carted"
                        }
                    },
                    {
                        $unwind: "$Carted" // Unwind the carted array
                    },
                    {
                        $lookup: {
                            from: "categories", // Use the correct collection name for categories
                            localField: "Carted.SubCategory",
                            foreignField: "_id",
                            as: "SubCategory"
                        }
                    },

                    {
                        $project: {
                            id: "$Items.ProductId",
                            Quantity: "$Items.Quantity",
                            Color: "$Carted.Color",
                            Price: "$Carted.Price",
                            DiscountedPrice: "$Carted.DiscountedPrice",
                            Name: "$Carted.Name",
                            Images: { $arrayElemAt: ["$Carted.Images", 0] },
                            Category: "$SubCategory.Name",
                            SubCategory: "$SubCategory.Sub",
                            Discount: "$Carted.Discount",
                            isListed: "$Carted.isListed",
                            Stock: "$Carted.Stock",
                            DiscountedTotal: { $multiply: ["$Items.Quantity", "$Carted.DiscountedPrice"] },
                            Total: { $multiply: ["$Items.Quantity", "$Carted.Price"] }
                        }
                    }
                ]);
                const totalAmountPromise = Cart.aggregate([
                    {
                        $match: { User: new ObjectId(userId) }
                    },
                    {
                        $unwind: '$Items'
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "Items.ProductId",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    {
                        $project: {
                            product: { $arrayElemAt: ['$product', 0] },
                            'Items.Quantity': 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            TotalQuantity: { $sum: '$Items.Quantity' },
                            Total: { $sum: { $multiply: ['$Items.Quantity', '$product.Price'] } },
                            DiscountedTotal: { $sum: { $multiply: ['$Items.Quantity', '$product.DiscountedPrice'] } }

                        }
                    }
                ])
                // console.log("cart total  : ", totalAmountPromise)
                const [cart, totalAmount] = await Promise.all([cartPromise, totalAmountPromise]);
                resolve([cart, totalAmount])
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //editProduct -post
    editProduct: (productDetails, userId) => {

        let quantity = parseInt(productDetails.quantity)
        let proId = productDetails.proId
        let count = parseInt(productDetails.count)
        const itemObjectId = new ObjectId(proId);


        return new Promise(async (resolve, reject) => {
            try {

                if (quantity == 1 && count == -1) {
                    await Cart.updateOne({ User: userId, 'Items.ProductId': itemObjectId }, {
                        $pull: { Items: { ProductId: itemObjectId } }
                    })
                    resolve()
                }
                else {
                    await Cart.updateOne(
                        { User: userId, 'Items.ProductId': itemObjectId },
                        {
                            $inc: { 'Items.$.Quantity': count }
                        }
                    );
                    resolve()


                }
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })


    },


    //deleteCartProduct, postPlaceOrder- post
    deleteCartProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const cart = await Cart.deleteOne({ User: userId })
                resolve(cart)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },

    //addToWishlist
    addToWishlist: async (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            // const product = await Product.findOne({ _id: proId })
            try {
                const itemObjectId = new ObjectId(proId);


                let userWish = await Wishlist.findOne({ User: userId });

                if (userWish) {
                    let itemIndex = userWish.Items.findIndex(item => item.ProductId.equals(itemObjectId));

                    if (itemIndex !== -1) {
                        resolve()
                    } else {
                        await Wishlist.updateOne(
                            { User: userId },
                            {
                                $push: { Items: { ProductId: itemObjectId } }
                            }
                        );
                    }
                } else {
                    await Wishlist.create(
                        {
                            User: userId,
                            Items: [{ ProductId: itemObjectId }]
                        }
                    );
                }

                resolve();
            } catch (error) {
                // Handle errors here
                console.error("Error in addToWishlist:", error);
                reject(error);
            }
        })
    },



    // wishlist
    wishlist: async (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([
                    Wishlist.findOne({ User: userId }).populate('Items.ProductId'),
                    Cart.findOne({ User: userId })
                ]).then(async ([wishlist, cart]) => {
                    let cartMap = null
                    if (cart) {
                        cartMap = await cart.Items.map(item => item.ProductId.toString())
                    }
                    console.log("wishlist ", wishlist)
                    if (wishlist) {
                        wishlist = wishlist.Items
                    }
                    resolve([wishlist, cartMap])
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    // removeWishlist
    removeWishlist: async (proId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                Wishlist.updateOne(
                    { User: userId },
                    { $pull: { 'Items': { ProductId: proId } } }).then(() => { resolve() })

            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //wishlistCount
    wishlistCount: async (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                Wishlist.findOne({ User: userId }).then(
                    (userWishlist) => {
                        if (userWishlist) {
                            count = userWishlist.Items.length;
                        }
                        resolve(count);
                    }
                );
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },

    //getCart
    getCart: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                Cart.findOne({ User: userId }).then((cart) => {
                    resolve(cart)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    
};
