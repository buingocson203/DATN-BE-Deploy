import Account from "../models/Account.js";
import { accountValid } from "../validation/account.js";

export const createAccount = async (req, res) => {
  try {
    const body = req.body;

    // Validate body account data
    const { error } = accountValid.validate(body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const newAccount = new Account(body);
    const account = await newAccount.save();

    return res.status(200).json({
      message: "Create Account Successful",
      data: account,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const body = req.body;
    const { user } = req;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Only the user can update their account information
    if (account.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return res.status(403).json({
        message: "You do not have permission to update this account",
      });
    }

    // Validate body account data
    const { error } = accountValid.validate(body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    account.name = body.name;
    account.phone = body.phone;
    account.gender = body.gender;

    // Only admin can update the role
    if (user.role === "admin") {
      account.role = body.role;
    }

    const updatedAccount = await account.save();

    return res.status(200).json({
      message: "Update Account Successful",
      data: updatedAccount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "You do not have permission to access all accounts",
      });
    }

    const accounts = await Account.find().populate("userId", "userName email");

    return res.status(200).json({
      message: "Fetch All Accounts Successful",
      data: accounts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAccountDetail = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { user } = req;

    const account = await Account.findById(accountId).populate("userId", "userName email");

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Check if the user has permission to view the account details
    if (user.role !== "admin" && account.userId._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to view this account",
      });
    }

    return res.status(200).json({
      message: "Fetch Account Detail Successful",
      data: account,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
