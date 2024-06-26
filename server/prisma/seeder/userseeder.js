const { throwError } = require("../../routes/utils/helper")
const { prisma } = require("../../routes/utils/prisma")
const bcrypt = require('bcrypt')

const users = [
    {
        name: 'Teddy Lazuardi',
        email: 'TeddyLazuardi@gmail.com',
        role: "USER",
        number: '085678901234',
        password: 'Teddy1234',
    },
    {
        name: "Admin 1",
        email: "admin1@gmail.com",
        role: "ADMIN",
        password: "password"
    },
    {
        name: "User 1",
        email: "user1@gmail.com",
        role: "USER",
        password: "password"
    },
    {
        name: "Customers 1",
        email: "customer1@gmail.com",
        role: "CUSTOMER",
        password: "password"
    },
    {
        name: "Customers 2",
        email: "customer2@gmail.com",
        role: "CUSTOMER",
        password: "password"
    },
]

const userSeed = async () => {
    try {
        for (let user of users) {
            const salt = await bcrypt.genSalt()
            user.password = await bcrypt.hash(user.password, salt)
            await prisma.user.upsert({
                where: { email: user.email },
                create: user, update: user
            })
        }
    } catch (err) {
        throwError(err)
    }
}

module.exports = { userSeed }