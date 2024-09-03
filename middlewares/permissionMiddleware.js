const { PrismaClient } = require('@prisma/client');

const prisma=new PrismaClient()

exports.checkBoxPermission = (action) => {
    return async (req, res, next) => {
        const { userId } = req.user;
        const { boxId } = req.params;

        const permission = await prisma.boxPermission.findFirst({
            where: {
                boxId: parseInt(boxId),
                userId: parseInt(userId),
            },
        });

        if (permission && permission[`can${action.charAt(0).toUpperCase() + action.slice(1)}`]) {
            next();
        } else {
            res.status(403).json({ error: "Forbidden" });
        }
    };
};
