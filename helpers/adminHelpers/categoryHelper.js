const Category = require('../../models/categoryModel')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = {


    findCategory: (Name) => {
        return new Promise(async (resolve, reject) => {
            try {

                const category = await Category.findOne({ Name: Name })
                if (category) {
                    console.log('abc')
                    resolve(category)
                }
                reject(new Error('Category Not Found'))
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    addCategory: (categoryData, Image) => {
        return new Promise(async (resolve, reject) => {
            try {


                if (Array.isArray(categoryData.Sub)) {
                    for (i = 0; i < categoryData.Sub.length; i++) {
                        const category = new Category({
                            Name: categoryData.Name,
                            Sub: categoryData.Sub[i],
                            Image: Image
                        })
                        await category.save();
                        resolve()
                    }

                }
                else {
                    if (categoryData.Sub > 0) {
                        const category = new Category({
                            Name: categoryData.Name,
                            Sub: categoryData.Sub,
                            Image: Image
                        })
                        await category.save();
                        resolve()
                    } else {
                        const category = new Category({
                            Name: categoryData.Name,
                            Sub: null,
                            Image: Image
                        })
                        await category.save();
                        resolve()
                    }
                }
            } catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    getSubCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {

                Category.find().then((subCategory) => {
                    resolve(subCategory)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }

        })
    },


    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                Category.find().then((subCategory) => {
                    resolve(subCategory)
                })
            } catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    editExistStatus: (id, Exist) => {
        return new Promise(async (resolve, reject) => {
            try {

                Category.findByIdAndUpdate(id, { isExist: Exist }).then((response) => {
                    resolve()
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })

    },


    getCategoryNotRepeat: () => {
        return new Promise(async (resolve, reject) => {
            try {

                const category = await Category.aggregate([
                    {
                        $group: {
                            _id: null,
                            category: { $addToSet: "$Name" },
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            category: 1
                        }
                    }
                ])

                //  console.log("category after aggregation : ",category[0].category);
                resolve(category[0].category)

            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    // getSubCategory:(category)=>{
    //     return new Promise (async(resolve, reject)=>{
    //         const sub= await Category.find({Name:category},{Sub:1,_id:1})

    //         resolve (sub)
    //     })
    // },


    //editCategory - get
    getSubCategoryByCategoryName: (category) => {
        return new Promise(async (resolve, reject) => {
            try {
                Category.find({ Name: category }).then((sub) => {
                    resolve(sub)
                })

            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },


    editCategory: (categoryData, Image) => {
        return new Promise(async (resolve, reject) => {
            try {


                if (Image === null) {
                    await Category.findByIdAndUpdate(categoryData.id, {
                        Name: categoryData.Name,
                        Sub: categoryData.Sub,

                    }, { new: true })
                } else {
                    await Category.findByIdAndUpdate(categoryData.id, {
                        Name: categoryData.Name,
                        Sub: categoryData.Sub,
                        Image: Image

                    }, { new: true })
                }
                resolve()
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    },

    //getSubCategory
    getSubCategoryOne: (id) => {
        return new Promise(async (resolve, reject) => {
            try {

                console.log("ffffffffffff")
                Category.findOne(new ObjectId(id)).then((sub) => {
                    resolve(sub)
                })
            }
            catch (err) {
                console.log("error  : ", err.message)
                reject(err)
            }
        })
    }



}