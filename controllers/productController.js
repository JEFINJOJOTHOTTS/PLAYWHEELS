const categoryHelper = require('../helpers/adminHelpers/categoryHelper')
const couponHelper = require('../helpers/adminHelpers/couponHelper')
const productHelper = require('../helpers/adminHelpers/productHelper')
const cartHelper = require('../helpers/userHelpers/cartHelper')
const orderHelper = require('../helpers/userHelpers/orderHelper')

const Product = require('../models/productModel')


//home
const home = async (req, res) => {
    try {
        if (res.locals.user) {
            const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
            const wishlistPromise = cartHelper.wishlistCount(res.locals.user._id)
            const subCategoryPromise = categoryHelper.getSubCategory()
            const couponPromise = couponHelper.getActiveCoupons()
            const productsPromise = productHelper.newArrivals()
            const [cart, wishlistCount, subCategory, coupon, products] = await Promise.all([cartPromise, wishlistPromise, subCategoryPromise, couponPromise, productsPromise])
            const [cartItems, totalAmount] = cart

            res.render('user/home', { user: true, subCategory, coupon, products, userName: res.locals.user.FirstName, wishlistCount, cartItems, totalAmount, message: null, title: "" })


        } else {
            const subCategoryPromise = categoryHelper.getSubCategory()
            const couponPromise = couponHelper.getActiveCoupons()
            const productsPromise = productHelper.newArrivals()

            const [subCategory, coupon, products] = await Promise.all([subCategoryPromise, couponPromise, productsPromise])
            res.render('user/home', { user: false, message: null, title: "error", subCategory, coupon, products })

        }

    }
    catch (err) {
        console.log("Error   : ", err)
        res.redirect('/login')
    }
}

//add Product  - get 
const loadAddProduct = async (req, res) => {
    try {
        categoryHelper.getCategoryNotRepeat().then(async (Category) => {
            res.render('admin/addProduct', { Category, message: null, title: "error", Sub: [] })


        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


// addproduct axios call - sub-category 
const findSubCategory = (req, res) => {
    try {

        category = req.params.category
        console.log(category)
        categoryHelper.getSubCategoryByCategoryName(category).then((sub) => {
            res.json(sub)
        })
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}

//add- product -post 
const addProduct = async (req, res) => {
    try {
        // console.log(req.body)
        // const data = req.body
        // console.log(data.Color)
        // data.Images = req.files
        productHelper.addProduct(req.body, req.files).then(() => {
            res.redirect('/admin/products')
        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }

}

//products -get, viewProducts
const viewProducts = async (req, res) => {
    try {
        productHelper.getProducts().then(async (product) => {

            res.render('admin/products', { product, message: null, title: "Admin Products" })


        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


//editProduct - get 
const loadEditProduct = async (req, res) => {
    try {
        let id = req.params.id
        productHelper.getProduct(id).then(async (product) => {

            res.render('admin/editProduct', { product, message: null, title: "error" })


        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


//listproduct
const listProduct = async (req, res) => {
    try {
        const id = req.params.id
        const status = req.params.status
        console.log(status)
        productHelper.listProduct(id, status).then(() => {
            res.json()
        })
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


//editProduct -post
const editProduct = async (req, res) => {
    try {
        // console.log(req.files)
        productHelper.editProduct(req.body, req.files).then(() => {
            res.redirect('/admin/products')
        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


//get - viewSingleProduct
const getProduct = async (req, res) => {
    try {
        let id = req.params.id
        console.log(id)
        productHelper.getProduct(id).then(async (product) => {
            if (res.locals.user) {
                const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
                const wishlistPromise = cartHelper.wishlistCount(res.locals.user._id)
                const [cart, wishlistCount] = await Promise.all([cartPromise, wishlistPromise])
                const [cartItems, totalAmount] = cart
                // console.log(product)
                res.render('user/viewProduct', { user: true, userName: res.locals.user.FirstName, wishlistCount, cartItems, totalAmount, product: product, message: null, title: "error" })


            } else {
                res.render('user/viewProduct', { user: false, product: product, message: null, title: "error" })

            }

        })
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')
    }
}




//get- viewSingleProduct
const getProductAdmin = async (req, res) => {
    try {
        let id = req.params.id
        console.log(id)
        productHelper.getProduct(id).then((product) => {
            // console.log(product)
            console.log(product.Name)
            res.render('admin/viewProduct', { product: product, message: null, title: "error" })

        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}



//getShop -get
const getShop = async (req, res) => {
    try {
        console.log("///////////////////////////")
        console.log("req.query   :  ", req.query)
        console.log("search   :   ", req.query.search)

        console.log("sort   :   ", req.query.sort)
        console.log("filter   :   ", req.query.filter)

        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        // const skip = (page - 1) * limit; // Calculate the number of products to skip
        const searchQuery = req.query.search || ''; // Get the search query from request query parameters
        const sortQuery = req.query.sort;
        const filterCat = req.query.filter
        // let search = "";
        // const pageSize = 12;
        // const products = await Product.find(query)
        // .skip((currentPage - 1) * pageSize)
        // .limit(pageSize);
        // console.log("///////////////////////////")




        const Color = req.query.Color;
        const PowerTrain = req.query.PowerTrain;
        const Manufacturer = req.query.Manufacturer;


        // Prepare the filter object based on Color and PowerTrain
        const filter = {
            isListed: true,
            Stock: { $gt: 0 }
        };
        // Build the search filter
        let searchFilter = {
            $and: [
                {
                    isListed: true,
                    Stock: { $gt: 0 }
                },
                {
                    $or: [
                        { Name: { $regex: new RegExp(searchQuery || '', 'i') } },
                    ],
                },
            ],
        };


        if (Array.isArray(Color)) {
            // filter.Color = { $in: Color.map(color => color.toLowerCase()) };
            filter.Color = Color.map(color => new RegExp(color, 'i'));
            searchFilter = filter
        } else if (Color) {
            filter.Color = new RegExp(Color, 'i')
            searchFilter = filter
        }
        if (Array.isArray(PowerTrain)) {
            filter.PowerTrain = PowerTrain.map(powerTrain => new RegExp(powerTrain, 'i'));
            searchFilter = filter
        } else if (PowerTrain) {
            filter.PowerTrain = new RegExp(PowerTrain, 'i')
            searchFilter = filter
        }





        if (filterCat) {
            searchFilter = {
                $and: [
                    { isListed: true, Stock: { $gt: 0 } },
                    {
                        $or: [
                            { SubCategory: filterCat },
                        ],
                    },
                ],
            };

        }
        if (Manufacturer) {
            searchFilter = {
                $and: [
                    { isListed: true, Stock: { $gt: 0 } },
                    {
                        $or: [
                            { Manufacturer: Manufacturer },
                        ],
                    },
                ],
            };

        }

        const totalProductsPromise = Product.countDocuments(searchFilter); // Get the total number of products matching the search query

        const newProductsPromise = productHelper.newArrivals()
        const productPromise = productHelper.getShopProducts(searchFilter, sortQuery)
        const categoryPromise = categoryHelper.getCategoryNotRepeat()
        const subCategoryPromise = categoryHelper.getSubCategory()

        const colorPromise = productHelper.getAllColor()
        const powerTrainPromise = productHelper.getAllPowerTrain()
        const [product, category, subCategory, totalProducts, color, powerTrain, newProducts] = await Promise.all([productPromise, categoryPromise, subCategoryPromise, totalProductsPromise, colorPromise, powerTrainPromise, newProductsPromise]);
        const totalPages = await Math.ceil(totalProducts / limit); // Calculate the total number of pages   

        if (res.locals.user) {

            const cartPromise = cartHelper.getCartProduct(res.locals.user._id)
            const wishlistPromise = cartHelper.wishlistCount(res.locals.user._id)
            const [cart, wishlistCount] = await Promise.all([cartPromise, wishlistPromise])
            const [cartItems, totalAmount] = cart

            res.render('user/shop', { newProducts, color, user: true, powerTrain, userName: res.locals.user.FirstName, wishlistCount, cartItems, totalProducts, totalAmount, product, category, subCategory, currentPage: page, totalPages, message: null, title: "Shop" })

        } else {
            res.render('user/shop', { newProducts, color, user: false, product, powerTrain, category, subCategory, currentPage: page, totalProducts, totalPages, message: null, title: "Shop" })

        }
    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/login')

    }
}


//addNewColor - get 
const loadAddNewColor = async (req, res) => {
    try {
        console.log("loadAddNewColor")

        let id = req.params.id
        productHelper.getProduct(id).then(async (product) => {

            res.render('admin/addNewcolor', { product, message: null, title: "error" })


        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


//addNewColor - post
const addNewColor = async (req, res) => {
    try {
        console.log("addNewColor")

        productHelper.addNewColor(req.body, req.files).then(() => {
            res.redirect('/admin/products')
        })

    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }
}


//dashboard - get admin
const dashboard = async (req, res) => {
    try {
        const response = await orderHelper.revenue()
        // orderHelper.revenue().then((revenue) => {
        // console.log("Revenue : ", revenue[0].totalFinalAmount)
        // console.log("orders : ", revenue[0].count)

        const yearlySalesChart = await orderHelper.yearlySalesChart()
        // console.log(`yearlySalesChart   :   `,yearlySalesChart  )
        const groupedData = yearlySalesChart.reduce((acc, monthData) => {
            const { year } = monthData;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(monthData);
            return acc;
        }, {});

        console.log(groupedData)

        const categorySales = await orderHelper.categorySales()
        // const totalSubCategories = await Category.countDocuments()
        // const totalProducts = await Product.countDocuments(); // Get the total number of products matching the search query
        // console.log("totalProducts  :  ", totalProducts)
        // console.log("totalSubCategory  :  ", totalSubCategories)

        res.render('admin/dashboard', { message: null, title: "Dashboard", response, yearlySalesChart, groupedData, categorySales })

        // })
        // console.log("Revenue : ", revenue)
        // console.log("orders : ", orders)
        // res.render('admin/dashboard', { message: null, title: "Dashboard" })


    }
    catch (err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')

    }

}


module.exports = {
    findSubCategory,
    loadAddProduct,
    addProduct,
    viewProducts,
    loadEditProduct,
    listProduct,
    editProduct,
    getProduct,
    getShop,
    getProductAdmin,
    loadAddNewColor,
    addNewColor,
    dashboard,
    home
}
