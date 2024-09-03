const { PrismaClient } = require('@prisma/client');

const prisma=new PrismaClient()

exports.createBox = async (req, res) => {
    const { userId } = req.user;
    const { title } = req.body;

    const box = await prisma.box.create({
        data: {
            title,
            ownerId: userId,
        },
    });
    res.status(201).json(box);
};

exports.uploadImage = async (req, res) => {
    const { boxId } = req.params;
    const { url } = req.body;

    const image = await prisma.image.create({
        data: {
            url,
            boxId: parseInt(boxId),
        },
    });
    res.status(201).json(image);
};

exports.setBoxPermissions = async (req, res) => {
    const { boxId } = req.params;
    const { userId, canUpload, canView } = req.body;

    const permission = await prisma.boxPermission.create({
        data: {
            boxId: parseInt(boxId),
            userId: parseInt(userId),
            canUpload,
            canView,
        },
    });
    res.status(201).json(permission);
};
