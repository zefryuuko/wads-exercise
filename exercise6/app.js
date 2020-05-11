const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv/config');
const Course = require('./courses.model')
const Account = require('./account.model')

// Express Configuration
const app = express();
const port = 6969;
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Mongoose configuration
// Required in .env file:
// - MONGO_USER         : Database username
// - MONGO_PASS         : Database password
// - MONGO_HOST         : MongoDB server hostname
// - MONGO_POOL_SIZE    : Max number of connections allowed
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        poolSize: process.env.MONGO_POOL_SIZE
    }, 
    (err) => {
        if (err) {
            console.err(err);
            return;
        }
        console.log("Connected to MongoDB server.");
    }
);

// Allow CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    // Bypass specific routes
    const path = req.path.split('/');
    if (path[1] == '' || path[1].toLowerCase() == 'auth' ) {
        next();
        return;
    }

    // Check if header exists
    if (!(req.headers.authorization && req.headers.authorization.startsWith("Bearer "))) {
        res.status(401).json({"message": "You are not authorized to access this route."});
        return;
    }

    // Authenticate user token
    const apiToken = req.headers.authorization.split()[1];
    const tokenExists = Account.findOne({ apiToken });
    if (!tokenExists) {
        res.status(401).json({"message": "You are not authorized to access this route."});
        return;
    }

    next();
}
app.use(authMiddleware);


//
// Routes
//

// Root route
app.get('/', (req, res) => {
    res.json({
        "message": "API is working"
    });
});

// Auth routes
app.post('/auth', async (req, res) => {
    try {
        // Check if request body has all the required parameters
        const { username, password } = req.body;
        if (!(username && password)) {
            if (req.body.password) req.body.password = "CONTENT REDACTED";
            res.status(422).json({
                "message": "Missing required parameters. Required: username, password",
                "received": req.body
            });
            return;
        }

        // Get API token
        const result = await Account.findOne(
            { username: username, password: crypto.createHash('SHA256').update(password).digest('base64') },    // Query condition
            { __v: 0, _id: 0 }                  // Filter out backend references
        );
        
        // If course does not exist
        if (!result) {
            res.status(401).json({
                "message": `Invalid credentials.`
            });
            return;
        }
        
        // Return message with API token
        res.json({
            "message": "Authenticated successfully.",
            "apiToken": result.apiToken
        });
    } catch (err) {
        // Send 500 Internal Server Error
        res.status(500).json({
            "message": `${err}` // Convert error message to string to prevent invalid JSON parsing.
        });
    }
});

// CRUD routes
// Create Course
app.post('/courses', async (req, res) => {
    try {
        // Check if request body has all the required parameters
        const { code, name, description, scu } = req.body;
        if (!(code && name && description && scu)) {
            res.status(422).json({
                "message": "Missing required parameters. Required: code, name, description, scu",
                "received": req.body
            });
            return;
        }

        // Add data to database
        req.body._id = mongoose.Types.ObjectId();   // Add new ObjectId field required by mongoose
        const newCourse = new Course(req.body);
        const result = await newCourse.save();
        res.json({
            "message": "Course added successfully."
        });
    } catch (err) {
        // Send 500 Internal Server Error
        res.status(500).json({
            "message": `${err}` // Convert error message to string to prevent invalid JSON parsing.
        });
    }
});

// Read Courses
app.get('/courses', async (req, res) => {
    try {
        // Get courses
        const result = await Course.find(
            {  },                               // Query condition
            { __v: 0, _id: 0 }                   // Filter out backend references
        );
        
        // Send result
        res.json(result);
    } catch (err) {
        // Send 500 Internal Server Error
        res.status(500).json({
            "message": `${err}` // Convert error message to string to prevent invalid JSON parsing.
        });
    }
});

// Read Course
app.get('/courses/:courseCode', async (req, res) => {
    try {
        // Get course
        const result = await Course.findOne(
            { code: req.params.courseCode },    // Query condition
            { __v: 0, _id: 0 }                   // Filter out backend references
        );
        
        // If course does not exist
        if (!result) {
            res.status(404).json({
                "message": `Course with code '${req.params.courseCode}' does not exist.`
            });
            return;
        }

        // Send result
        res.json(result);
    } catch (err) {
        // Send 500 Internal Server Error
        res.status(500).json({
            "message": `${err}` // Convert error message to string to prevent invalid JSON parsing.
        });
    }
});

// Update Course
// Use PATCH method instead of PUT as it only updates the fields that are changed
app.patch('/courses/:courseCode', async (req, res) => {
    try {
        // Check if request body has the required parameters
        const { code, name, description, scu } = req.body;
        if (!(code || name || description || scu)) {
            res.status(422).json({
                "message": "Missing parameters. Accepts: code, name, description, scu",
                "received": req.body
            });
            return;
        }

        // Get course
        const result = await Course.updateOne(
            { code: req.params.courseCode },    // Query condition
        { $set: req.body }                      // New data to be patched
        );
        
        // If course does not exist
        if (result.n == 0) {
            res.status(404).json({
                'message': `Course with code ${req.params.courseCode} does not exist.`
            });
            return;
        }

        // Send result
        res.json({
            "message": "Course updated successfully"
        });
    } catch (err) {
        // Send 500 Internal Server Error
        res.status(500).json({
            "message": `${err}` // Convert error message to string to prevent invalid JSON parsing.
        });
    }
});

// Delete Course
app.delete('/courses/:courseCode', async (req, res) => {
    try {
        // Get course
        const result = await Course.deleteOne(
            { code: req.params.courseCode },    // Query condition
        );
        
        // If course does not exist
        if (result.deletedCount < 1) {
            res.status(404).json({
                'message': `Course with code ${req.params.courseCode} does not exist.`
            });
            return;
        }

        // Send result
        res.json({
            "message": "Course deleted successfully"
        });
    } catch (err) {
        // Send 500 Internal Server Error
        res.status(500).json({
            "message": `${err}` // Convert error message to string to prevent invalid JSON parsing.
        });
    }
});




app.listen(port, () => console.log(`App listening at http://0.0.0.0:${port}`));