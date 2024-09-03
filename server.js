const express=require ('express')
const app=express()
require('dotenv').config(); 
app.use(express.json())
const boxRoutes = require('./routes/boxRoutes');

const authRoutes = require('./routes/authRoutes.js');
app.use('/api/auth',authRoutes)
app.use('/api/box', boxRoutes);
const PORT = process.env.PORT 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
