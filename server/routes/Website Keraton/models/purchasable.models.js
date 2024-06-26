const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const subTypeModel =  require('../models/purchasableSubType.models')

const isExist = async (id) => {
    try{
        return await prisma.purchasable.findFirst({ where: { id } })
    }catch(err){
        throwError(err)
    }
}

const getAll = async (query = { type, subType}) => {
    let { type, subType } = query
    try {
        return await prisma.purchasable.findMany({
            where: {
                subType:{
                    ...(subType != undefined && {id: +subType}),
                    ...(type != undefined && { typeId: +type })
                }
            },
            include: { subType: true }
        })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (id) => {
    try{
        return await prisma.purchasable.findFirstOrThrow({
            where: { id }
        })
    }catch(err){
        throwError(err)
    }
}

const createUpdate = async (ident,data = { id, name, desc, unit, price, priceUmum, priceMancanegara, image, subTypeId }) => {
    try{
        if(ident != 'edit'){
            const subType = await subTypeModel.isExist(data.subTypeId)
            if(!subType) throw Error('Sub Type didnt exist')
        }
        return ident != 'edit' ? await prisma.purchasable.create({ data }) : await prisma.purchasable.update({ where: { id: data.id }, data })
    }catch(err){
        throwError(err)
    }
}

module.exports = { isExist, getOne, getAll, createUpdate }