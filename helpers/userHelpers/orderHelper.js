
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const Cart = require('../../models/cartModel');
const Order = require('../../models/orderModel');
const Category = require('../../models/categoryModel');
const Wallet = require('../../models/walletModel');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');


module.exports = {


    //revenue
    revenue: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const revenue = await Order.aggregate([
                    {
                        $unwind: "$Orders"
                    },
                    {
                        $match: {
                            "Orders.delivery_status": "Delivered"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },

                            totalFinalAmount: {
                                $sum: {
                                    $toDouble: {
                                        $trim: {
                                            input: "$Orders.amount.FinalAmount",
                                            chars: " "
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]);

                const totalSubCategories = await Category.countDocuments()
                const totalProducts = await Product.countDocuments(); // Get the total number of products matching the search query



                resolve({ revenue, totalSubCategories, totalProducts })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //graph
    graph: () => {
        return new Promise(async (resolve, reject) => {
            try {

            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //placeOrder
    placeOrder: (formData, userId, userName, cartItems, totalAmount, DeliveryAddress) => {

        return new Promise(async (resolve, reject) => {
            try {
                console.log("formData   ", formData)
                let orderId = null
                let x = 0
                let delivery_status = "Pending"
                if (formData.checkbox) {
                    // console.log("checkbox   ", formData.checkbox)
                    x = 1
                }

                let timestamp = Date.now();
                // const orderId = timestamp.toString()

                const date = new Date(timestamp);

                const day = date.getDate();
                const month = date.getMonth() + 1; // Months are zero-indexed, so add 1
                const year = date.getFullYear();

                // Create a "date/month/year" string
                const formattedDate = `${day}/${month}/${year}`;
                // console.log(timestamp)
                // console.log("    ll  ", formData.fname[x])
                // console.log("llllllllll    ", totalAmount[0])

                formData.Razorpay_id = null

                if (formData.payment_option == "Razorpay") {
                    orderId = formData.Razorpay
                } else {
                    orderId = timestamp.toString()

                }


                const newOrder = {
                    User: userId,
                    Orders: [
                        {
                            orderId: orderId,
                            User: userId,
                            UserName: userName,
                            products: cartItems,
                            amount: formData,
                            payment_option: formData.payment_option,
                            delivery_status: delivery_status,
                            delivered: false,
                            Razorpay_id: formData.Razorpay_id,
                            orderDate: formattedDate,
                            address:
                                DeliveryAddress[formData.Address]
                            ,
                        },
                    ],
                };

                const OrderDetails = await Order.findOneAndUpdate(
                    { User: userId },
                    { $push: { Orders: newOrder.Orders[0] } },
                    { upsert: true }
                );

                resolve(orderId)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })

    },

    //getOrders - get
    getOrders:async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                Order.findOne({ User: userId }).select('Orders').then((order) => {
                    if (order && order.Orders && order.Orders.length > 0) {
                        order.sortedOrders = order.Orders.reverse()
                    }
                    resolve(order)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    //cancelOrder 
    cancelOrder: (orderId, userId, status, reason) => {
        return new Promise(async (resolve, reject) => {
            try {

                const order = await Order.findOne(
                    { User: userId, "Orders.orderId": orderId },
                    { "Orders.$": 1 }
                ).exec();

                await Order.findOneAndUpdate(
                    { User: userId, "Orders": { $elemMatch: { orderId: orderId } } },
                    {
                        $set: {
                            'Orders.$.delivery_status': status,
                            'Orders.$.cancellation_reason': reason
                        }
                    },
                    { new: true }
                );

                console.log("order   :  ", order)
                resolve(order)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //listOrder  -get  - admin
    listOrder: () => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("jjjjjjjjjjjjjjjjjjjj")
                // Order.aggregate([
                //     {
                //         $unwind: "$Orders"
                //     },
                //     {
                //         $addFields: {
                //             "Orders.orderDate": {
                //                 $dateFromString: {
                //                     dateString: "$Orders.orderDate",
                //                     format: "%d/%m/%Y"
                //                 }
                //             },
                //             "Orders._id": "$_id" // Include _id from the original document inside Orders array
                //         }
                //     },
                //     {
                //         $addFields: {
                //             "Orders.orderDate": {
                //                 $dateToString: {
                //                     date: "$Orders.orderDate",
                //                     format: "%d/%m/%Y"
                //                 }
                //             }
                //         }
                //     },
                //     {
                //         $sort: {
                //             "Orders.orderDate": 1
                //         }
                //     },
                //     {
                //         $group: {
                //             _id: "$_id",
                //             Orders: { $push: "$Orders" }
                //         }
                //     }
                // ])



                Order.aggregate([
                    {
                        $unwind: "$Orders"
                    },
                    {
                        $addFields: {
                            "Orders.orderDate": {
                                $dateFromString: {
                                    dateString: "$Orders.orderDate",
                                    format: "%d/%m/%Y"
                                }
                            },
                            "Orders._id": "$_id"
                        }
                    },
                    {
                        $sort: {
                            "Orders.orderDate": -1
                        }
                    },
                    {
                        $addFields: {
                            "Orders.orderDate": {
                                $dateToString: {
                                    date: "$Orders.orderDate",
                                    format: "%d/%m/%Y"
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            Orders: { $push: "$Orders" }
                        }
                    }
                ])

                    // Order.aggregate([
                    //     {
                    //         $unwind: "$Orders"
                    //     },
                    //     {
                    //         $addFields: {
                    //             "Orders.orderDate":
                    //                 "$Orders.orderDate",


                    //             "Orders._id": "$_id"
                    //         }
                    //     },

                    //     {
                    //         $sort: {
                    //             "Orders.orderDate": -1
                    //         }
                    //     },
                    //     {
                    //         $group: {
                    //             _id: "$_id",
                    //             Orders: { $push: "$Orders" }
                    //         }
                    //     }
                    // ])
                    .then((result) => {
                        resolve(result[0].Orders);
                    })


            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //order
    order: (id, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {

                Order.aggregate([
                    {
                        $match: { _id: new ObjectId(id) }, // Match the _id
                    },
                    {
                        $unwind: '$Orders', // Unwind the 'Orders' array
                    },
                    {
                        $match: { 'Orders.orderId': orderId }, // Match the orderId within the 'Orders' array
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "User",
                            foreignField: "_id",
                            as: "User"
                        }
                    },
                    {
                        $project: {
                            User: 1,
                            Orders: 1, // Include only the 'Orders' array in the result
                            _id: 0, // Exclude the '_id' field from the result
                        },
                    },
                ])
                    .
                    then((order) => {
                        console.log(order)
                        resolve(order[0])
                    })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    // stockAvailability
    stockAvailability: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                const cartItems = await Cart.findOne({ User: userId })
                // console.log("cartItems   ...  ", cartItems)
                for (const cartItem of cartItems.Items) {
                    const product = await Product.findOne({
                        _id: cartItem.ProductId,
                        Stock: { $gte: cartItem.Quantity },
                        isListed: true
                    })
                    // console.log("product   ... ", product)
                    if (!product) {
                        resolve({ status: false })
                    }
                }
                resolve({ status: true })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    addToRefund: (cart, RazorpayDetails, userId, amount) => {

        return new Promise(async (resolve, reject) => {
            try {

                console.log("cart    ", cart)
                const WalletTransaction = { Items: cart.Orders, TransationDetails: RazorpayDetails }
                console.log("WalletTransaction   :   ", WalletTransaction)

                // console.log("RazorpayDetails    :   ",RazorpayDetails)
                const wallet = await Wallet.findOne({ User: userId })
                if (wallet) {
                    await Wallet.findOneAndUpdate({ User: userId },
                        {
                            $push: { WalletTransaction: WalletTransaction },
                            $inc: { Wallet: amount }
                        }
                    )

                } else {
                    const WalletDetails = new Wallet({
                        User: userId,
                        WalletTransaction: [WalletTransaction],
                        Wallet: amount
                    })
                    await WalletDetails.save();

                }

                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })


    },


    getWallet: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const wallet = await Wallet.findOne({ User: userId })
                resolve(wallet)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    updateWalletAmount: (userId, amount) => {
        return new Promise(async (resolve, reject) => {
            try {
                const wallet = await Wallet.updateOne({ User: userId }, {
                    $inc: { Wallet: -amount }
                })
                resolve(wallet)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    yearlySalesChart: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const yearlySalesGraph = await Order.aggregate([
                    {
                        $unwind: {
                            path: "$Orders",
                        },
                    },
                    {
                        $match: {
                            "Orders.delivery_status": "Delivered",
                        },
                    },
                    {
                        $addFields: {
                            orderDate: {
                                $dateFromString: {
                                    dateString: "$Orders.orderDate",
                                    format: "%d/%m/%Y"
                                }
                            },
                            totalSales: {
                                $toDouble: "$Orders.amount.FinalAmount"
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$orderDate" },
                                month: { $month: "$orderDate" }
                            },
                            totalSales: {
                                $sum: "$totalSales"
                            },
                        },
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.month": 1,
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            year: "$_id.year",
                            monthSort: "$_id.month", // Rename to monthSort for sorting purposes
                            month: {
                                $arrayElemAt: [
                                    [
                                        "",
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec",
                                    ],
                                    "$_id.month",
                                ]
                            },
                            totalSales: "$totalSales",
                        },
                    },
                ]);


                console.log("yearlySales   :   ", yearlySalesGraph)
                resolve(yearlySalesGraph)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    //categorySales
    categorySales: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const categorySales = await Order.aggregate(
                    [
                        {
                            $unwind:

                            {
                                path: "$Orders",
                            },
                        },
                        {
                            $match:

                            {
                                "Orders.delivery_status": "Delivered",
                            },
                        },
                        {
                            $lookup:

                            {
                                from: "products",
                                localField:
                                    "Orders.products.id",
                                foreignField: "_id",
                                as: "products",
                            },
                        },
                        {
                            $project:

                            {
                                products: 1,
                            },
                        },
                        {
                            $unwind:

                            {
                                path: "$products",
                            },
                        },
                        {
                            $lookup:

                            {
                                from: "categories",
                                localField:
                                    "products.SubCategory",
                                foreignField: "_id",
                                as: "categories",
                            },
                        },

                        {
                            $group:

                            {
                                _id: "$categories.Name",
                                count: {
                                    $sum: 1,
                                },
                            },
                        },
                    ]
                )



                console.log("categorySales   :  ", categorySales)
                resolve(categorySales)
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    // getSalesReport
    getSalesReport: (startDateForm, endDateForm) => {
        return new Promise(async (resolve, reject) => {
            try {
                let startDate = null
                let endDate = null
                console.log("endDate   : ", endDateForm)
                let matchStage = {
                    "Orders.delivery_status": "Delivered"
                };

                if (startDateForm && endDateForm) {
                    startDate = new Date(startDateForm);
                    endDate = new Date(endDateForm);

                    endDate.setDate(endDate.getDate() + 1);

                    matchStage.$expr = {
                        $and: [
                            {
                                $gte: [
                                    {
                                        $dateFromString: {
                                            dateString: "$Orders.orderDate",
                                            format: "%d/%m/%Y"
                                        }
                                    },
                                    startDate
                                ]
                            },
                            {
                                $lt: [
                                    {
                                        $dateFromString: {
                                            dateString: "$Orders.orderDate",
                                            format: "%d/%m/%Y"
                                        }
                                    },
                                    endDate
                                ]
                            }
                        ]
                    };
                }

                const orderDetails = await Order.aggregate([
                    {
                        $project: {
                            "User": 1,
                            "Orders": 1
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "User",
                            foreignField: "_id",
                            as: "userDetails"
                        }
                    },
                    {
                        $unwind: "$Orders"
                    },
                    {
                        $unwind: "$userDetails"
                    },
                    {
                        $match: matchStage
                    },
                    {
                        $project: {
                            firstname: "$userDetails.FirstName",
                            lastName: "$userDetails.LastName",
                            email: "$userDetails.Email",
                            ordersId: "$Orders.orderId",
                            paymentMethod: "$Orders.payment_option",
                            orderStatus: "$Orders.delivery_status",
                            totalPrice: {
                                $toDouble: "$Orders.amount.FinalAmount"
                            },
                            createdAt: {
                                $dateFromString: {
                                    dateString: "$Orders.orderDate",
                                    format: "%d/%m/%Y"
                                }
                            }
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    }
                ]);

                for (let i = 0; i < orderDetails.length; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('Do MMMM YYYY');
                }

                resolve(orderDetails);
            } catch (err) {
                console.log("error  : ", err.message);
                reject(err);
            }
        });
    }

}