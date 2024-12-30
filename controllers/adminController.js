const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const upsertUser = async (req, res) => {
    const { id, email, password } = req.body;

    console.log("\u2705 Received user request", { id, email, password });

    if (!email || !password) {
        console.log("\u26A0\uFE0F Validation failed: Missing email or password");
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        if (id) {
            console.log("\u270D\uFE0F Updating user with ID:", id);
            const user = await User.findByIdAndUpdate(
                id,
                { email, password },
                { new: true, runValidators: true } 
            );

            if (!user) {
                console.log("\u274C User not found with ID:", id);
                return res.status(404).json({ message: 'User not found' });
            }

            console.log("\u2705 User updated successfully", user);
            res.status(200).json({ message: 'User updated', user });
        } else {
            console.log("\u2795 Adding new user");
            // Add new user if no ID is provided
            const newUser = await User.create({ email, password });
            console.log("\u2705 New user added successfully", newUser);
            res.status(201).json({ message: 'User added', user: newUser });
        }
    } catch (error) {
        console.error("\u26D4\uFE0F Error processing user request", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { email, password },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({ message: 'Failed to update user' });
    }
  };
  

module.exports = { getUsers, upsertUser, deleteUser,updateUser };
