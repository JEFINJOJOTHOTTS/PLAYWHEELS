const express = require('express')
const router = express.Router()
const multer = require('../helpers/multer')
const middle = require('../middleware/authAdmin')

//controller
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const categoryController = require('../controllers/categoryController')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const couponController = require('../controllers/couponController')



//trial
// router.get('/', (req, res) => {
//     console.log("asd")
//     res.render('admin/dashboard',{message:null, title:"error"})
// })
// router.get('/viewProduct', (req, res) => {
//     console.log("asd")
//     res.render('admin/prod',{message:null, title:"error"})
// })

//dashboard
router.get('/', middle.requireAuth, productController.dashboard)
router.get('/salesReport',middle.requireAuth, orderController.saleReport)

//Coupon
router.get('/coupons', middle.requireAuth, couponController.loadCoupons)
router.post('/coupons', middle.requireAuth, couponController.coupons)

router.get('/couponStatus/:couponId/:status',middle.requireAuth, couponController.couponsStatus)

//add-Category
router.get('/addCategory', middle.requireAuth, categoryController.loadAddCategory)
router.post('/addCategory', multer.single('Image'),  middle.requireAuth,categoryController.addCategory)

router.get('/validCategoryName/:Name', middle.requireAuth, categoryController.validCategoryName)

//userManagment
router.post('/userManagement',middle.requireAuth, adminController.userUpdate)
router.get('/userManagement',middle.requireAuth, adminController.viewUser)


//category
router.get('/category', middle.requireAuth, categoryController.loadCategory)


//editCategory
router.get('/existCategory/:id/:Exist', middle.requireAuth, categoryController.changeExistCategoryStatus)

router.get('/addNewSubCategory/:category', middle.requireAuth, categoryController.loadAddNewSubCategory)
router.post('/addNewSubCategory',  multer.single('Image'),  categoryController.addNewSubCategory)

router.get('/editCategory/:id', middle.requireAuth, categoryController.loadEditCategory)
router.post('/editCategory',  multer.single('Image'),  categoryController.editCategory)


//add-products
router.get('/addProduct', middle.requireAuth, productController.loadAddProduct)
router.post('/addProduct', multer.array('Image', 12), middle.requireAuth, productController.addProduct)

router.get('/addNewColor/:id', middle.requireAuth,productController.loadAddNewColor)
router.post('/addNewColor',multer.array('Image', 2), productController.addNewColor)

router.get('/getSubCategory/:category', middle.requireAuth, productController.findSubCategory)


//edit-product
router.get('/editProduct/:id', middle.requireAuth, productController.loadEditProduct)
router.post('/editProduct', multer.fields([{ name: 'Image1', maxCount: 1 },{ name: 'Image2', maxCount: 1 }]), middle.requireAuth, productController.editProduct)


//list or unlist Product
router.get('/listProduct/:id/:status', middle.requireAuth, productController.listProduct)


//products
router.get('/products',  middle.requireAuth,productController.viewProducts)
router.get('/viewProduct/:id', middle.requireAuth,productController.getProductAdmin)


//Orders
router.get('/listOrder', middle.requireAuth,orderController.getOrders)
router.get('/order/:id/:orderId', middle.requireAuth,orderController.order)
router.get('/cancelOrder/:orderId/:userId/:status', middle.requireAuth, orderController.cancelOrderAdmin)


//login
router.get('/login',middle.checkLogout,adminController.loadLogin)
router.post('/login', adminController.login)


//logout
router.get('/logout', adminController.logout)


module.exports = router