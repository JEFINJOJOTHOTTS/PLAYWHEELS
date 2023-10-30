const cartHelper = require('../helpers/userHelpers/cartHelper')
const couponHelper = require('../helpers/adminHelpers/couponHelper')
const userHelpers = require('../helpers/userHelpers/userHelper')
const orderHelpers = require('../helpers/userHelpers/orderHelper')
const productHelper = require('../helpers/adminHelpers/productHelper')
const paymentGate = require('../helpers/paymentGateway')
const mongoose = require("mongoose");


module.exports = {

    //placeOrder- get
    getPlaceOrder: async (req, res) => {
        try {
            const DeliveryAddress = res.locals.user.DeliveryAddress

            const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
            const wishlistPromise = cartHelper.wishlistCount(res.locals.user._id)
            const couponPromise = couponHelper.getActiveCoupons()
            const [cart, wishlistCount, Coupons] = await Promise.all([cartPromise, wishlistPromise, couponPromise])
            const [cartItems, totalAmount] = cart
            // console.log("totalAmount  :  ", totalAmount)
            res.render('user/shop-checkout', { user: true, Coupons, userName: res.locals.user.FirstName, wishlistCount, cartItems, totalAmount, message: null, title: "PlaceOrder", DeliveryAddress })


        } catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },


    //placeOrder-post
    postPlaceOrder: async (req, res) => {
        try {

            const [cartItems, totalAmount] = await cartHelper.getCartProduct(res.locals.user._id);
            const cart = await cartHelper.getCart(res.locals.user._id)

            const [deleteResult, addressResult, stockUpdateResult, OrderId] = await Promise.all([
                cartHelper.deleteCartProduct(res.locals.user._id),
                // userHelpers.updateAddress(req.body, res.locals.user._id),
                productHelper.stockUpdate(cartItems),


                orderHelpers.placeOrder(req.body, res.locals.user._id, res.locals.user.FirstName, cartItems, totalAmount, res.locals.user.DeliveryAddress)
            ]);
            if (req.body.payment_option == 'Wallet') {
                await orderHelpers.updateWalletAmount(res.locals.user._id, req.body.FinalAmount)
            }
            res.redirect(`/order-success?orderId=${OrderId}`);

        } catch (err) {
            console.log("Error   :   ", err)
            res.render('error404')

        }
    },


    //viewOrders -get 
    profile: async (req, res) => {
        try {
            console.log("    view orders")
            console.log(res.locals.user._id)
            orderHelpers.getOrders(res.locals.user._id).then(async (orders) => {
               
                const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
                const wishlistPromise = cartHelper.wishlistCount(res.locals.user._id)
                const [cart, wishlistCount] = await Promise.all([cartPromise, wishlistPromise])
                const [cartItems, totalAmount] = cart
                const wallet = await orderHelpers.getWallet(res.locals.user._id)

                // let orderData = null
                // console.log("orders")
                // console.log("..................", orders)
                if (orders != null) {
                    orderData = orders.sortedOrders

                }
                res.render('user/profile', { user: true, wallet, userName: res.locals.user.FirstName, cartItems, wishlistCount, DeliveryAddress:res.locals.user.DeliveryAddress, totalAmount, orderData, orders, message: null, title: "User Profile" })

            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }

    },


    //cancelOrder
    cancelOrder: async (req, res) => {
        try {
            console.log("req.body     ", req.body)
            const order = await orderHelpers.cancelOrder(req.body[0].orderId, res.locals.user._id, "Cancelled", req.body[0].value)
            console.log("order   ...   :   ...  ", order)
            let amount = order.Orders[0].amount.FinalAmount
            if (order.payment_option != "COD") {
                await orderHelpers.addToRefund(order, req.body[0], res.locals.user._id, amount)
            }
            console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
            res.json()
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')

        }
    },


    //returnOrder
    returnOrder: async (req, res) => {
        try {
            console.log("req.body     ", req.body)
            const order = await orderHelpers.cancelOrder(req.body[0].orderId, res.locals.user._id, "Return", req.body[0].value)
            console.log("order   ...   :   ...  ", order)
            let amount = order.Orders[0].amount.FinalAmount
            if (order.payment_option != "COD") {
                await orderHelpers.addToRefund(order, req.body[0], res.locals.user._id, amount)
            }
            res.json()
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')

        }
    },

    //listOrder   - get - admin
    getOrders: async (req, res) => {
        try {
            orderHelpers.listOrder().then((orders) => {

                console.log("orders   :  ", orders)
                res.render('admin/listOrders', { orders, message: null, title: "Orders" })
            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin/login')

        }
    },

    //cancelOrder  - admin
    cancelOrderAdmin: async (req, res) => {
        try {
            await orderHelpers.cancelOrder(req.params.orderId, req.params.userId, req.params.status, "Admin Side Cancellation")
            res.redirect('/admin/listOrder')
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')

        }
    },


    //order - admin
    order: async (req, res) => {
        try {
            console.log("jfadsgifugiahihoh")
            orderHelpers.order(req.params.id, req.params.orderId).then((order) => {
                console.log("order   : ", order)
                res.render('admin/order', { order, message: null, title: "Order" })
            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin/login')

        }
    },


    //shockAvailabilityOrder -axios
    shockAvailabilityOrder: async (req, res) => {
        try {
            orderHelpers.stockAvailability(res.locals.user._id).then((status) => {
                console.log()
                res.json(status.status)
            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')

        }
    },

    razorpay: async (req, res) => {
        try {
            paymentGate.razorpay(req.params.amount).then((RazorpayDetails) => {
                res.json(RazorpayDetails)
            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')

        }
    },

    addToRefund: async (req, res) => {
        try {
            const [cart, totalAmount] = await cartHelper.getCartProduct(res.locals.user._id)
            let amount = req.body.amount / 100
            orderHelpers.addToRefund(cart, req.body, res.locals.user._id, amount).then(() => {
                res.json()
            })
        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },

    //getOrder  - user
    getOrder: async (req, res) => {
        try {
            console.log("kkkkkkkkkkkkkkkkkkkk")
            console.log("req.params.id     :   ", req.params.id)
            console.log("req.params.id     :   ", req.params.orderId)
            Promise.all([
                orderHelpers.order(req.params.id, req.params.orderId),
                cartHelper.getCartProduct(res.locals.user._id),
                cartHelper.wishlistCount(res.locals.user._id)]).then(([order, cart, wishlistCount]) => {
                    const [cartItems, totalAmount] = cart
                    res.render('user/order', { user: true, id: req.params.id, userName: res.locals.user.FirstName, cartItems, wishlistCount, totalAmount, order, message: null, title: "Order" })
                })

        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    }
    ,

    //orderSuccess  - user
    orderSuccess: async (req, res) => {
        try {
            const OrderId = req.query.orderId

            res.render('user/orderSuccess', { title: "OrderUpdate", message: "Success", OrderId })

        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },

    //walletPayment  - user
    walletPayment: async (req, res) => {
        try {
            const amount = req.params.amount
            const wallet = await orderHelpers.getWallet(res.locals.user._id)
            if (wallet) {
                if (wallet.Wallet < amount) {
                    res.json(wallet.Wallet)
                } else {
                    orderHelpers.updateWalletAmount(res.locals.user._id, amount).then(() => {
                        res.json({ status: true })
                    })
                }
            } else {
                res.json(0)
            }

        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/login')
        }
    },

    // salesReport
    saleReport: async (req, res) => {
        try {
            let startDate = req.query.startDate
            let endDate = req.query.endDate
            const saleReport = await orderHelpers.getSalesReport(startDate, endDate)
            res.render('admin/salesReport', { title: "Sales Report", response: saleReport })

        }
        catch (err) {
            console.log("Error   :   ", err)
            res.redirect('/admin')
        }

    }
}