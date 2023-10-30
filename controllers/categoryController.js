const categoryHelper = require('../helpers/adminHelpers/categoryHelper')
const sharp = require('sharp')
const imageHelper = require('../helpers/imageHelper')


//addCategory - get 
const loadAddCategory = (req, res) => {
    try {
        res.render('admin/addCategory', { message: null, title: "error" })
    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
     }
}

//addCategory,addNewSubCategory -post
const addCategory = async (req, res) => {
    try {
        const originalFileName = req.file.originalname;

        const fileExtension = originalFileName.split('.').pop(); // Extract file extension

        const imageBuffer = await sharp(req.file.buffer)
            .resize({
                width: 400,
                height: 500,
                fit: "cover",
            })
            .toBuffer();

        const imagePath = `${Date.now()}.${fileExtension}`;
        await sharp(imageBuffer).toFile(`public/uploads/` + imagePath);
        await categoryHelper.addCategory(req.body, imagePath)

        res.redirect('/admin/category')
    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}

const validCategoryName = (req, res) => {
    try {
        let Name = req.params.Name;
        categoryHelper.findCategory(Name).then((category) => {
            console.log("Category Exist")
            res.json("Exist")

        }).catch((err) => {
            console.log("Category not exist")
            res.json()
        })
    }    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}

//category
const loadCategory = async (req, res) => {
    try {
        const category = await categoryHelper.getCategoryNotRepeat()
        const subCategory = await categoryHelper.getCategory()
        const keys = Object.keys(category)
        console.log("category     ", category)
        res.render('admin/category', { keys, subCategory, category, message: null, title: "error" })


    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }

}


//existCategory
const changeExistCategoryStatus = (req, res) => {
    try {
        id = req.params.id
        Exist = req.params.Exist
        categoryHelper.editExistStatus(id, Exist).then(() => {
            res.json()
        })
    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}


//addNewSubCategory - get 
const loadAddNewSubCategory = async (req, res) => {
    try {
        let category = req.params.category
        categoryHelper.getSubCategoryByCategoryName(category).then(async (sub) => {
            console.log("sub", sub)
            res.render('admin/addSubCategory', { sub, message: null, title: "error" })


        })

    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}


//editCategory -post
const addNewSubCategory = async (req, res) => {
    try {
        
            const originalFileName = req.file.originalname;

            const fileExtension = originalFileName.split('.').pop(); // Extract file extension

            const imageBuffer = await sharp(req.file.buffer)
                .resize({
                    width: 400,
                    height: 500,
                    fit: "cover",
                })
                .toBuffer();

            const imagePath = `${Date.now()}.${fileExtension}`;
            await sharp(imageBuffer).toFile(`public/uploads/` + imagePath);
            imageHelper.deleteImage(req.body.existingImage)
        
        await categoryHelper.editCategory(req.body, imagePath)


        res.redirect('/admin/category')

    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}


//addNewSubCategory - get 
const loadEditCategory = async (req, res) => {
    try {
        console.log("wwwwwwwwwwwwwwwwwwww")
        let id = req.params.id
        categoryHelper.getSubCategoryOne(id).then(async (sub) => {
            console.log("sub", sub)
            res.render('admin/editCategory', { sub, message: null, title: "error" })


        })

    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}


//editCategory -post
const editCategory = async (req, res) => {
    try {
        let imagePath=null
        if(!(req.file===undefined)){
            const originalFileName = req.file.originalname;

            const fileExtension = originalFileName.split('.').pop(); // Extract file extension

            const imageBuffer = await sharp(req.file.buffer)
                .resize({
                    width: 400,
                    height: 500,
                    fit: "cover",
                })
                .toBuffer();

            imagePath = `${Date.now()}.${fileExtension}`;
            await sharp(imageBuffer).toFile(`public/uploads/` + imagePath);
            // imageHelper.deleteImage(req.body.existingImage)
        }
        
        await categoryHelper.editCategory(req.body, imagePath)


        res.redirect('/admin/category')

    }
    catch(err) {
        console.log("Error   :   ", err)
        res.redirect('/admin/login')
 
    }
}


module.exports = {
    loadAddCategory,
    addCategory,
    validCategoryName,
    loadCategory,
    changeExistCategoryStatus,
    loadAddNewSubCategory,
    loadEditCategory,
    addNewSubCategory,
    editCategory
}