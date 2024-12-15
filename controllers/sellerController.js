const Seller = require("../models/Seller");

const insertseller = async (request, response) => {
    try {
      const input = request.body;
      const seller = new Seller(input);
      await seller.save();
      response.send("Registered Successfully");
    } catch (e) {
      response.status(500).send(e.message);
    }
};

// Check if the email already exists
const scheckemail = async (req, res) => {
    const { email } = req.body;

    try {
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return res
          .status(400)
          .json({ message: "seller with this email already exists" });
      }
      res.status(200).json({ message: "Email is available" });
    } catch (error) {
      res.status(500).json({ message: "Error checking email", error });
    }
};

const checksellerlogin = async (request, response) => {
    try {
      const input = request.body;
      const seller = await Seller.findOne(input);

      if (!seller) {
        return response.status(404).send("Seller not found");
      }

      // Remove password from the response
      const { password, ...sellerWithoutPassword } = seller.toObject();

      response.json(sellerWithoutPassword);
    } catch (error) {
      response.status(500).send(error.message);
    }
};

module.exports = { insertseller, checksellerlogin, scheckemail };
