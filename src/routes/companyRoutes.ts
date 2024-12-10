import express, { Request, Response } from "express";
import { Company } from "../models/Company";
import authorise, { AuthenticatedRequest } from "../middlewares/authorise";

const router = express.Router();

// Add a Company
router.post("/add", authorise, async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerID, name, commercialName, slogan, vat, category, industry, imgIds, backgroundImg, mobile, address, phone, employees } = req.body;

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      res.status(400).json({ message: "Company already exists" });
      return;
    }

    const newCompany = new Company({
      ownerID, //should be the id of the user
      name,
      commercialName,
      slogan,
      vat,
      category,
      industry,
      imgIds,
      backgroundImg,
      mobile,
      address,
      phone,
      employees,
    });
    await newCompany.save();

    res.status(200).json({ message: "Company added successfully", company: newCompany });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Edit a Company
router.put("/edit/:id", authorise, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const companyID = req.params.id;
    const updateData = req.body;
    const userID  = req.userID;
    // Check if the company exists
    const existingCompany = await Company.findOne({ _id: companyID });
    if (!existingCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Ensure only the owner can edit
    if (existingCompany.ownerID !== userID) {
      res.status(403).json({ message: "Unauthorized to edit this company" });
      return;
    }

    // Update the company
    const updatedCompany = await Company.findOneAndUpdate({ _id: companyID }, updateData, { new: true });
    res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Delete a Company
router.delete("/delete/:id", authorise, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const companyID = req.params.id;
    const userID  = req.userID;
    // Check if the company exists
    const existingCompany = await Company.findOne({ _id: companyID });
    if (!existingCompany) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Ensure only the owner can delete
    if (existingCompany.ownerID !== userID) {
      res.status(403).json({ message: "Unauthorized to delete this company" });
      return;
    }

    // Delete the company
    await Company.deleteOne({ _id: companyID });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});


// Get Companies by User
router.get("/get", authorise, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userID, email } = req;

    if (!userID && !email) {
      res.status(400).json({ message: "User ID or email is required" });
      return;
    }

    const query = { ownerID: userID };

    const companies = await Company.find(query);
    if (!companies || companies.length === 0) {
      res.status(404).json({ message: "No companies found for the given user" });
      return;
    }

    res.status(200).json({ message: "Companies retrieved successfully", companies });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default router;
