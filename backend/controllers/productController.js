import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'
import reviewModel from '../models/reviewModel.js'
import userModel from '../models/userModel.js'
import categoryModel from '../models/categoryModel.js'
import attributeModel from '../models/attributeModel.js'
import mongoose from 'mongoose'
// function for add product
const parseJsonField = (value, defaultValue) => {
    if (!value) return defaultValue
    try {
        if (typeof value === 'string') {
            return JSON.parse(value)
        }
        return value
    } catch (error) {
        return defaultValue
    }
}

const addProduct = async (req, res) => {
    const { name, description, price, category, subCategory, thirdCategory, sizes, bestseller, categoryId, subCategoryId, thirdCategoryId } = req.body
    const attributeIdsRaw = req.body.attributes || req.body.attributeIds
    const image1 = req.files.image1 && req.files.image1[0]
    const image2 = req.files.image2 && req.files.image2[0]
    const image3 = req.files.image3 && req.files.image3[0]
    const image4 = req.files.image4 && req.files.image4[0]
    console.log(subCategory)
    const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

    let imagesUrl = await Promise.all(
        images.map(async (item) => {
            let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" })
            return result.secure_url
        })
    )

    let resolvedCategoryName = category
    let resolvedSubCategoryName = subCategory
    let resolvedThirdCategoryName = thirdCategory
    let resolvedCategoryId = categoryId
    let resolvedSubCategoryId = subCategoryId
    let resolvedThirdCategoryId = thirdCategoryId

    try {
        if (categoryId) {
            const categoryDoc = await categoryModel.findById(categoryId)
            if (!categoryDoc) {
                return res.status(400).json({ success: false, message: 'Selected parent category does not exist' })
            }
            resolvedCategoryName = categoryDoc.name
            resolvedCategoryId = categoryDoc._id
        }

        if (subCategoryId) {
            const subCategoryDoc = await categoryModel.findById(subCategoryId)
            if (!subCategoryDoc) {
                return res.status(400).json({ success: false, message: 'Selected sub category does not exist' })
            }
            resolvedSubCategoryName = subCategoryDoc.name
            resolvedSubCategoryId = subCategoryDoc._id

            if (!resolvedCategoryId && subCategoryDoc.parent) {
                resolvedCategoryId = subCategoryDoc.parent
                const parent = await categoryModel.findById(subCategoryDoc.parent)
                resolvedCategoryName = parent?.name || resolvedCategoryName
            }
        }

        if (thirdCategoryId) {
            const thirdCategoryDoc = await categoryModel.findById(thirdCategoryId)
            if (!thirdCategoryDoc) {
                return res.status(400).json({ success: false, message: 'Selected third category does not exist' })
            }
            resolvedThirdCategoryName = thirdCategoryDoc.name
            resolvedThirdCategoryId = thirdCategoryDoc._id

            if (!resolvedSubCategoryId && thirdCategoryDoc.parent) {
                resolvedSubCategoryId = thirdCategoryDoc.parent
                const subParent = await categoryModel.findById(thirdCategoryDoc.parent)
                resolvedSubCategoryName = subParent?.name || resolvedSubCategoryName
                
                if (subParent?.parent && !resolvedCategoryId) {
                    resolvedCategoryId = subParent.parent
                    const mainParent = await categoryModel.findById(subParent.parent)
                    resolvedCategoryName = mainParent?.name || resolvedCategoryName
                }
            }
        }
    } catch (error) {
        console.error('Error resolving categories:', error)
        return res.status(500).json({ success: false, message: 'Failed to resolve categories' })
    }

    const attributeEntries = parseJsonField(attributeIdsRaw, [])
    let attributeValues = []
    if (Array.isArray(attributeEntries) && attributeEntries.length) {
        const ids = [...new Set(
            attributeEntries
                .map(entry => entry?.attributeId || entry?.attribute || entry?.id)
                .filter(Boolean)
                .map(id => String(id))
        )]

        if (ids.length) {
            const attributes = await attributeModel.find({ _id: { $in: ids } })
            const attrMap = new Map(attributes.map(attr => [String(attr._id), attr]))

            attributeValues = attributeEntries
                .map(entry => {
                    const attrId = entry?.attributeId || entry?.attribute || entry?.id
                    const value = typeof entry?.value === 'string' ? entry.value.trim() : String(entry?.value || '').trim()
                    if (!attrId || !value) return null
                    const attrDoc = attrMap.get(String(attrId))
                    if (!attrDoc) return null
                    return {
                        attribute: attrDoc._id,
                        value,
                    }
                })
                .filter(Boolean)
        }
    }


    const productData = {
        name,
        description,
        category: resolvedCategoryName,
        categoryId: resolvedCategoryId || undefined,
        price: Number(price),
        subCategory: resolvedSubCategoryName,
        subCategoryId: resolvedSubCategoryId || undefined,
        thirdCategory: resolvedThirdCategoryName,
        thirdCategoryId: resolvedThirdCategoryId || undefined,
        bestseller: bestseller === "true" ? true : false,
        sizes: parseJsonField(sizes, []),
        attributes: attributeValues,
        image: imagesUrl,
        date: Date.now()
    }

    const product = new productModel(productData)

    if (product.price === 0) {
        product.price = undefined
    }
    if (product.sizes.length === 0) {
        product.sizes = undefined
    }
    if (product.category === '') {
        product.category = undefined
    }
    if (product.subCategory === '') {
        product.subCategory = undefined
    }
    try {
        await product.save()
        res.json({ success: true, message: "Product Added" })
    }
    catch (error) {
        console.log(error.errors.price)
        if ("price" in error.errors) {
            console.log("yes")
            res.json({ success: false, message: "please fullfill the price" })
        }
        if ("sizes" in error.errors) {
            res.json({ success: false, message: "please select at least 1 size" })
        }
        if ("category" in error.errors) {
            res.json({ success: false, message: "category is required" })
        }
        if ("subCategory" in error.errors) {
            res.json({ success: false, message: "subCategory is required" })
        }
    }


}
// comment on products
const submitComment = async (req, res) => {
    try {
        const { review_id, productId } = req.body
        const currenctProduct = await productModel.findById(productId)
        currenctProduct.reviews.push(review_id)
        await currenctProduct.save()
        res.json({ success: true, message: "comment added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//show comments on produt page

const commentsList = async (req, res) => {
    try {
        const { productId } = req.body;

        // 验证 productId 是否有效
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: '无效的 productId' });
        }

        // 查找产品并填充评论数据（使用 populate 一次性获取所有数据）
        const currentProduct = await productModel.findById(productId)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'userId',
                    select: 'name'
                },
                options: { sort: { createdAt: -1 } } // 按创建时间降序排序
            })
            .lean();

        if (!currentProduct) {
            return res.status(404).json({ success: false, message: '产品未找到' });
        }

        // 获取评论数组，过滤掉无效的评论
        const reviews = (currentProduct.reviews || [])
            .filter(review => review && review._id)
            .map(review => ({
                _id: review._id,
                productId: review.productId || null,
                userId: review.userId?._id || null,
                rating: review.rating,
                comment: review.comment,
                media: review.media || [],
                createdAt: review.createdAt,
            }));

        // 提取用户名（已经通过 populate 获取）
        const userNames = (currentProduct.reviews || [])
            .filter(review => review && review._id)
            .map(review => review.userId?.name || 'Anonymous');

        console.log(`Fetched ${reviews.length} reviews for product ${productId}`);

        // 返回成功响应
        res.json({ success: true, message: '评论获取成功', reviews, userInfo: userNames });
    } catch (error) {
        console.error('获取评论失败:', error.message, error.stack);
        res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
    }
};
//update product
const updateProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, thirdCategory, sizes, bestseller, product_id, image1, image2, image3, image4, categoryId, subCategoryId, thirdCategoryId } = req.body
        const attributesRaw = req.body.attributes || req.body.attributeIds
        const currenctProduct = await productModel.findById(product_id)
        currenctProduct.image = []
        currenctProduct.image[0] = image1
        if (image2) {
            currenctProduct.image.push(image2)
        }
        if (image3) {
            currenctProduct.image.push(image3)
        }
        if (image4) {
            currenctProduct.image.push(image4)
        }


        currenctProduct.name = name
        currenctProduct.description = description
        currenctProduct.price = Number(price)
        currenctProduct.category = category
        currenctProduct.subCategory = subCategory
        currenctProduct.thirdCategory = thirdCategory
        currenctProduct.sizes = Array.isArray(sizes) ? sizes : parseJsonField(sizes, [])
        currenctProduct.bestseller = bestseller === "true" ? true : false

        if (categoryId) {
            const parentCategory = await categoryModel.findById(categoryId)
            if (!parentCategory) {
                return res.status(400).json({ success: false, message: 'Selected parent category does not exist' })
            }
            currenctProduct.categoryId = parentCategory._id
            currenctProduct.category = parentCategory.name
        }

        if (subCategoryId) {
            const childCategory = await categoryModel.findById(subCategoryId)
            if (!childCategory) {
                return res.status(400).json({ success: false, message: 'Selected sub category does not exist' })
            }
            currenctProduct.subCategoryId = childCategory._id
            currenctProduct.subCategory = childCategory.name
            if (!currenctProduct.categoryId && childCategory.parent) {
                currenctProduct.categoryId = childCategory.parent
                const parent = await categoryModel.findById(childCategory.parent)
                currenctProduct.category = parent?.name || currenctProduct.category
            }
        }

        if (thirdCategoryId) {
            const thirdCategory = await categoryModel.findById(thirdCategoryId)
            if (!thirdCategory) {
                return res.status(400).json({ success: false, message: 'Selected third category does not exist' })
            }
            currenctProduct.thirdCategoryId = thirdCategory._id
            currenctProduct.thirdCategory = thirdCategory.name
            
            if (!currenctProduct.subCategoryId && thirdCategory.parent) {
                currenctProduct.subCategoryId = thirdCategory.parent
                const subParent = await categoryModel.findById(thirdCategory.parent)
                currenctProduct.subCategory = subParent?.name || currenctProduct.subCategory
                
                if (subParent?.parent && !currenctProduct.categoryId) {
                    currenctProduct.categoryId = subParent.parent
                    const mainParent = await categoryModel.findById(subParent.parent)
                    currenctProduct.category = mainParent?.name || currenctProduct.category
                }
            }
        }

        if (attributesRaw !== undefined) {
            const attributeEntries = parseJsonField(attributesRaw, [])
            if (Array.isArray(attributeEntries) && attributeEntries.length) {
                const ids = [...new Set(
                    attributeEntries
                        .map(entry => entry?.attributeId || entry?.attribute || entry?.id)
                        .filter(Boolean)
                        .map(id => String(id))
                )]

                if (ids.length) {
                    const attributes = await attributeModel.find({ _id: { $in: ids } })
                    const attrMap = new Map(attributes.map(attr => [String(attr._id), attr]))

                    currenctProduct.attributes = attributeEntries
                        .map(entry => {
                            const attrId = entry?.attributeId || entry?.attribute || entry?.id
                            const value = typeof entry?.value === 'string' ? entry.value.trim() : String(entry?.value || '').trim()
                            if (!attrId || !value) return null
                            const attrDoc = attrMap.get(String(attrId))
                            if (!attrDoc) return null
                            return {
                                attribute: attrDoc._id,
                                value,
                            }
                        })
                        .filter(Boolean)
                } else {
                    currenctProduct.attributes = []
                }
            } else {
                currenctProduct.attributes = []
            }
        }

        await currenctProduct.save()

        res.json({ success: true, message: "product updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProduct = async (req, res) => {
    try {
        const {
            page: pageParam,
            limit: limitParam,
            search,
            all,
        } = req.query

        const filter = {}

        if (search && typeof search === 'string') {
            filter.name = { $regex: search.trim(), $options: 'i' }
        }

        if (all === 'true') {
            const products = await productModel
                .find(filter)
                .sort({ date: -1, _id: -1 })
                .populate('categoryId subCategoryId attributes.attribute')
                .lean()

            return res.json({
                success: true,
                products,
                pagination: {
                    page: 1,
                    limit: products.length,
                    total: products.length,
                    totalPages: 1,
                    mode: 'all',
                },
            })
        }

        const page = Math.max(parseInt(pageParam, 10) || 1, 1)
        const parsedLimit = Math.max(parseInt(limitParam, 10) || 20, 1)
        const limit = Math.min(parsedLimit, 100)
        const skip = (page - 1) * limit

        const sort = { date: -1, _id: -1 }

        const [products, total] = await Promise.all([
            productModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select('name price image category subCategory thirdCategory date categoryId subCategoryId thirdCategoryId bestseller')
                .lean(),
            productModel.countDocuments(filter),
        ])

        const totalPages = Math.max(Math.ceil(total / limit), 1)
        const currentPage = Math.min(page, totalPages)
        let paginatedProducts = products

        if (currentPage !== page && total > 0) {
            const correctedSkip = (currentPage - 1) * limit
            paginatedProducts = await productModel
                .find(filter)
                .sort(sort)
                .skip(correctedSkip)
                .limit(limit)
                .select('name price image category subCategory thirdCategory date categoryId subCategoryId thirdCategoryId bestseller')
                .lean()
        }

        res.json({
            success: true,
            products: paginatedProducts,
            pagination: {
                page: currentPage,
                limit,
                total,
                totalPages,
                mode: 'paginated',
            },
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const updateImg = async (req, res) => {
    try {
        // console.log(req.files.ImageObject)
        const image = req.files.ImageObject && req.files.ImageObject[0]
        let result = await cloudinary.uploader.upload(image.path, { resource_type: "image" })
        // const currenctProduct =await productModel.findById(req.body.productId)
        // console.log(currenctProduct.image[0])
        console.log(result.secure_url)
        res.json({ success: true, result })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
// function for remove product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "product removed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel
            .findById(productId)
            .populate('categoryId subCategoryId attributes.attribute')
        res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function to upload description image
const uploadDescriptionImage = async (req, res) => {
    try {
        console.log('Received description image upload request')
        
        // 检查是否有文件上传
        if (!req.file) {
            console.log('No file in request')
            return res.json({ success: false, message: 'No image file provided' })
        }

        console.log('File info:', req.file)

        // 上传到 Cloudinary，宽度800px，高度自动保持比例
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
            folder: "product-descriptions", // 将描述图片存放在特定文件夹
            transformation: [
                {
                    width: 800,
                    crop: "scale", // 缩放模式，保持原比例
                    quality: "auto:good" // 自动优化质量
                }
            ]
        })

        console.log('Cloudinary upload result:', result.secure_url)

        res.json({
            success: true,
            imageUrl: result.secure_url,
            message: 'Image uploaded successfully'
        })
    } catch (error) {
        console.error('Error uploading description image:', error)
        res.json({
            success: false,
            message: error.message || 'Failed to upload image'
        })
    }
}

export { 
    addProduct, 
    listProduct, 
    removeProduct, 
    singleProduct, 
    updateImg, 
    updateProduct, 
    submitComment, 
    commentsList, 
    uploadDescriptionImage 
}
