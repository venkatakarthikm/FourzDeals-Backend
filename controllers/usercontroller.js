const User = require("../models/User"); // models

const insertuser = async (request, response) => {
  try {
    const input = request.body;
    const user = new User(input);
    await user.save();
    response.send("Registered Successfully");
  } catch (e) {
    response.status(500).send(e.message);
  }
};

// Check if the email already exists
const checkemail =  async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    res.status(200).json({ message: "Email is available" });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

const checkuserlogin = async (request, response) => {
  try {
    const input = request.body;
    const user = await User.findOne(input);
    if (!user) {
      return response.status(404).send("user not found");
    }

    // Remove password from the response
    const { password, ...userWithoutPassword } = user.toObject();

    response.json(userWithoutPassword);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

module.exports = { insertuser, checkuserlogin,checkemail };
