const { PrismaClient } = require('@prisma/client');

const prisma=new PrismaClient()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:"email@gmail.com",
      pass:"password",
    },
  });
  const addUser = async (req, res) => {
    const userData = req.body
    const { email, password} = userData
    console.log("Email :", user)
    // Validate that all required fields are filled
  if (!email || !password) {
    return res
      .status(402)
      .json({ message: "Please ensure all fields are completed" })

  }try {
    // Check if the user already exists in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      if (user.verified) {
        // If user exists and email is verified
        return res
          .status(409)
          .json({ message: "The user is already registered. Please log in." });
      } else {
        // If user exists but email is not verified, update user data and resend verification email
        const salt = bcrypt.genSaltSync(10);
        userData.password = bcrypt.hashSync(password, salt);

        const updatedUser = await prisma.user.update({
          where: { email: email },
          data: userData,
        });

        const token = jwt.sign(
          { user_id: updatedUser.user_id },
          "secret key",
          {
            expiresIn: "1h",
          }
        );
        const authToken = jwt.sign(
          { user_id: updatedUser.user_id },
          "secret key",
          {
            expiresIn: "2160h",
          }
        );
        const link = `${process.env.BASE_URL}/emailVerify?token=${token}`;

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Verification mail from Facebook",
          text: link,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("❌ Error:", error.message);
          } else {
            console.log("✅ Email sent:", info.response);
          }
        });

        return res.status(201).json({
          message: "Verification email resent successfully",
          token: authToken,
        });
      }
    } else {
      // If user does not exist, create a new user and send verification email
      const salt = bcrypt.genSaltSync(10);
      userData.password = bcrypt.hashSync(password, salt);

      const newUser = await prisma.user.create({ data: userData });

      const token = jwt.sign(
        { user_id: newUser.user_id },
        "secret key",
        {
          expiresIn: "1h",
        }
      );
      const authToken = jwt.sign(
        { user_id: newUser.user_id },
       "secret key",
        {
          expiresIn: "2160h",
        }
      );

      const link = `${process.env.BASE_URL}/emailVerify?token=${token}`;

      const mailOptions = {
        from:"email@gmail.com",
        to: email,
        subject: "👋 Verification mail from facebook",
        text: link,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("❌ Error:", error.message);
        } else {
          console.log("✅ Email sent:", info.response);
        }
      });

      return res.status(201).json({
        message: "User registered successfully, verification email sent",
        token: authToken,
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
const collectSignupInfo = async (req, res) => {
    const userData = req.body;
    const user_id=req.user.user_id;
  

  
    if (
     
      userData.firstName === null ||
      userData.lastName === null 
    ) {
      return res
        .status(402)
        .json({ message: "Please ensure all fields are completed" });
    } else {
      try {
        const user = await prisma.user.findUnique({
          where: {
            user_id: user_id,
          },
        });
       
        if (user.verified === true) {
          try {
            const data = {
              first_name: userData.firstName,
              last_name: userData.lastName,
            }
            if (req.file) {
              data.profile_pic = req.file.key;
            }
            const result = await prisma.user.update({
              where: {
                user_id: user_id,
              },
              data,
            });
            return res.status(200).json({
              message: "The user information has been successfully created",
            });
          } catch (error) {
            console.log(error);
          } finally {
            await prisma.$disconnect();
          }
        } else {
          return res.status(403).json({ error: "Forbidden: User not verified" });
        }
      } catch (error) {
        console.log(error);
      }
    }
    
}

const login = async (req, res) => {
    const { email, password } = req.body;
  
    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }
  
    try {
      // Check if user exists in the database
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found, please sign up first" });
      }
  
      // Compare provided password with stored hashed password
      const isPasswordValid = bcrypt.compareSync(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id },
       "secret key",
        {
          expiresIn: "2160h", // 90 days
        }
      );
      delete user.user_id;
      delete user.password;
      return res.status(200).json({ message: "User login successful", token: token, data: user });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "An error occurred during login", error: error.message });
    }

};
module.exports = { addUser, collectSignupInfo,login };
