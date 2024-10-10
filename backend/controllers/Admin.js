import UserModel from "../models/user.js";
const Getuser = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    console.log(error);
  }
};

const deletUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const checkAdmin = await UserModel.findById(userId);

    if (checkAdmin.role == "admin") {
      return res.status(409).json({ message: "you can not delete yourself" });
    }
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ message: "user delete successfully ", user });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  try {
    
    const userId = req.params.id;
    const {userRole} = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role: userRole } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser, // Return the updated user
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export { Getuser, deletUser,updateUser };
