const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("tiqnora");

    const organizationCollection = db.collection("organizations");
    const eventsCollection = db.collection("events");
    const bookingsCollection = db.collection("bookings");
    const paymentsCollection = db.collection("payments");

    // Create organization


app.post("/api/organizations", async (req, res) => {
  try {
    const organization = req.body;

    const {
      organizationName,
      logo,
      website,
      description,
      organizerEmail,
      organizerName,
      status,
    } = organization;

    if (!organizationName || !logo || !description || !organizerEmail) {
      return res.status(400).send({
        success: false,
        message: "Required organization fields are missing.",
      });
    }

    const existingOrganization = await organizationCollection.findOne({
      organizerEmail,
    });

    if (existingOrganization) {
      return res.status(409).send({
        success: false,
        message: "You already have an organization profile.",
      });
    }

    const newOrganization = {
      organizationName,
      logo,
      website: website || "",
      description,
      organizerEmail,
      organizerName: organizerName || "Organizer",
      status: status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await organizationCollection.insertOne(newOrganization);

    res.status(201).send({
      success: true,
      message: "Organization created successfully.",
      data: {
        _id: result.insertedId,
        ...newOrganization,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to create organization.",
      error: error.message,
    });
  }
});

// only who create the organization he/she get info

app.get("/api/organizations", async (req, res) => {
  try {
    const organizerEmail = req.query.email;

    if (!organizerEmail) {
      return res.status(400).send({
        success: false,
        message: "Organizer email is required.",
      });
    }

    const organization = await organizationCollection.findOne({
      organizerEmail,
    });

    res.send({
      success: true,
      message: organization
        ? "Organization found."
        : "No organization found.",
      data: organization,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch organization.",
      error: error.message,
    });
  }
});


// Update Organization Own
app.patch("/api/organizations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid organization id.",
      });
    }

    const {
      organizationName,
      logo,
      website,
      description,
      organizerEmail,
      organizerName,
      status,
    } = updateData;

    if (!organizerEmail) {
      return res.status(400).send({
        success: false,
        message: "Organizer email is required.",
      });
    }

    if (!organizationName || !logo || !description) {
      return res.status(400).send({
        success: false,
        message: "Required organization fields are missing.",
      });
    }

    const filter = {
      _id: new ObjectId(id),
      organizerEmail,
    };

    const updateDoc = {
      $set: {
        organizationName,
        logo,
        website: website || "",
        description,
        organizerName: organizerName || "Organizer",
        status: status || "active",
        updatedAt: new Date(),
      },
    };

    const result = await organizationCollection.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Organization not found or you do not have permission.",
      });
    }

    const updatedOrganization = await organizationCollection.findOne(filter);

    res.send({
      success: true,
      message: "Organization updated successfully.",
      data: updatedOrganization,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to update organization.",
      error: error.message,
    });
  }
});



















    app.get("/", (req, res) => {
      res.send("Tiqnora server is running.");
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Tiqnora server running on port ${port}`);
});