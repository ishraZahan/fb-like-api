const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma=new PrismaClient()
exports.authenticate = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};
