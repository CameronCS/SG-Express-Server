//#region Require
// Node Requires
const express = require('express')
const bcrypt = require('bcrypt')
const fs   = require('fs')
const path = require('path')
// Local Requires
const upload = require('../middleware/MulterUsers')
const pool = require('../services/DB')
//#endregion

//#region Constants
const router = express.Router()
const saltRounds = 10
//#endregion

// Default route
router.get('/', (req, res) => {
    res.send('Default User route')
})

//#region POSTS
router.post('/add', upload.single('image'), async (req, res) => {
    console.log(JSON.stringify(req.body))
    try {
        const { first_name, last_name, username, password, is_admin, contact_no } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded!' });
        }

        const isAdmin = is_admin === 'true';
        console.log(isAdmin)

        const folder = isAdmin ? 'Admins' : 'Users';
        console.log(folder)
        const imagePath = `/uploads/${folder}/${req.file.filename}`;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (first_name, last_name, username, password, image_path, is_admin, contact_no)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        pool.query(query, [
            first_name,
            last_name,
            username,
            hashedPassword,
            imagePath,
            isAdmin,
            contact_no
        ], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'An error occurred while adding the user.' });
            }
            res.status(201).json({ message: 'User added successfully!' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body; 

    const query = `
        SELECT username, password FROM users
        WHERE username = ?
    `;

    pool.query(query, [username], async (err, results) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({ message: 'An error occurred while accessing the database.' });
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(404).json({
                user: {},
                message: 'Username or Password Invalid'
            });
        }

        // Extract the user data
        const user = results[0]; // Get the first result
        try {
            // Compare the password
            const password_match = await bcrypt.compare(password, user.password);
            if (!password_match) {
                return res.status(404).json({
                    user: {},
                    message: 'Username or Password Invalid'
                });
            }

            // If the password matches, return user details (excluding password)
            const userDetailsQuery = `
                SELECT id, first_name, last_name, username, image_path, is_admin, contact_no FROM users
                WHERE username = ?
            `;

            pool.query(userDetailsQuery, [username], (err, userResults) => {
                if (err) {
                    console.error(`Database error: ${err}`);
                    return res.status(500).json({ message: 'An error occurred while fetching user details.' });
                }

                // Send back user details
                return res.status(200).json({
                    user: userResults[0], // Send only the first user details
                    message: 'User details accepted'
                });
            });
        } catch (err) {
            console.error(`Bcrypt error: ${err}`);
            res.status(500).json({ message: 'There was an error validating the user' });
        }
    });
});

//#endregion POST

//#region GET
router.get('/check-username-available', (req, res) => {
    const { username } = req.query;

    const query = `
        SELECT username FROM users 
        WHERE username = ?
    `;

    pool.query(query, [username], (err, results) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({ message: 'An error occurred while checking the username.' });
        }

        if (results.length === 0) {
            return res.status(200).json({ message: 'Username is available' });
        }

        res.status(409).json({ message: 'Username already exists' });
    });
});

router.get('/all-usernames', (req, res) => {
    const { searching } = req.query;

    // Check if 'searching' parameter is provided
    if (!searching) {
        return res.status(400).json({
            usernames: [],
            message: 'The searching parameter is required.'
        });
    }

    // Query to check if the user is valid
    const checkUserQuery = `
        SELECT username FROM users
        WHERE username = ?
    `;

    pool.query(checkUserQuery, [searching], (err, result) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                usernames: [],
                message: 'There was an error finding the active user.'
            });
        }

        // Check if the searched username exists
        if (result.length === 0) {
            console.log('Username is invalid');
            return res.status(403).json({
                usernames: [],
                message: 'Active user is not a valid user.'
            });
        }

        // Query to get all usernames
        const usersQuery = `
            SELECT username FROM users
        `;

        pool.query(usersQuery, [], (err, results) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    usernames: [],
                    message: 'There was an error retrieving usernames.'
                });
            }

            // If no usernames are found
            if (results.length === 0) {
                return res.status(204).json({
                    usernames: [],
                    message: 'No usernames found.'
                });
            }

            // Filter out the searching username
            const usernames = results
                .map(_res => _res.username)
                .filter(username => username !== searching);

            res.status(200).json({
                usernames: usernames,
                message: 'Usernames found.'
            });
        });
    });
});

router.get('/get-contact', (req, res) => {
    const { child_id } = req.query;

    // Assuming you are using the MySQL connection pool
    const query = `
        SELECT u.first_name, u.last_name, u.contact_no
        FROM child_parent cp
        JOIN users u ON cp.u_id = u.id
        WHERE cp.c_id = ?
    `;

    pool.query(query, [child_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Respond with the parent contact information in the desired format
        const parents = results.map(row => ({
            first_name: row.first_name,
            last_name: row.last_name,
            contact_no: row.contact_no
        }));

        res.status(200).json({parents: parents});
    });
});


router.get('/search-specific', (req, res) => {
    const { searching, username_query } = req.query;

    // Check if 'searching' parameter is provided
    if (!searching) {
        return res.status(400).json({
            usernames: [],
            message: 'The searching parameter is required.'
        });
    }

    // Query to check if the user is valid
    const checkUserQuery = `
        SELECT username FROM users
        WHERE username = ?
    `;

    pool.query(checkUserQuery, [searching], (err, result) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                usernames: [],
                message: 'There was an error finding the active user.'
            });
        }

        // Check if the searched username exists
        if (result.length === 0) {
            console.log('Username is invalid');
            return res.status(403).json({
                usernames: [],
                message: 'Active user is not a valid user.'
            });
        }

        // Check if 'username_query' parameter is provided
        if (!username_query) {
            return res.status(400).json({
                usernames: [],
                message: 'The username_query parameter is required.'
            });
        }

        // Query to get usernames that contain the username_query
        const usersQuery = `
            SELECT username FROM users
            WHERE username LIKE ?
        `;

        // Pass the wildcard in the query
        pool.query(usersQuery, [`%${username_query}%`], (err, results) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    usernames: [],
                    message: 'There was an error retrieving usernames.'
                });
            }

            // If no usernames are found
            if (results.length === 0) {
                return res.status(204).json({
                    usernames: [],
                    message: 'No usernames found.'
                });
            }

            // Extract usernames from results
            const usernames = results.map(_res => _res.username);

            res.status(200).json({
                usernames: usernames,
                message: `Usernames found matching: ${username_query}`
            });
        });
    });
});
//#endregion GET

//#region PUT
router.put('/reset-password', (req, res) => {
    const { username, current_pass, new_pass } = req.body;

    // Step 1: Check if the username exists
    const checkUserQuery = `
        SELECT id, password FROM users
        WHERE username = ?
    `;

    pool.query(checkUserQuery, [username], async (err, result) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'An error occurred while checking the username.'
            });
        }

        // Check if the user exists
        if (result.length === 0) {
            return res.status(404).json({
                message: 'Username not found.'
            });
        }

        // Step 2: Verify the current password
        const userId = result[0].id;
        const hashedPassword = result[0].password;

        try {
            const passwordMatch = await bcrypt.compare(current_pass, hashedPassword);
            if (!passwordMatch) {
                return res.status(403).json({
                    message: 'Current password is incorrect.'
                });
            }

            // Step 3: Update the password
            const newHashedPassword = await bcrypt.hash(new_pass, 10);
            const updatePasswordQuery = `
                UPDATE users
                SET password = ?
                WHERE id = ?
            `;

            pool.query(updatePasswordQuery, [newHashedPassword, userId], (err, updateResult) => {
                if (err) {
                    console.error(`Database error: ${err}`);
                    return res.status(500).json({
                        message: 'An error occurred while updating the password.'
                    });
                }

                return res.status(200).json({
                    message: 'Password updated successfully.'
                });
            });

        } catch (error) {
            console.error(`Bcrypt error: ${error}`);
            return res.status(500).json({
                message: 'An error occurred while verifying the password.'
            });
        }
    });
});

router.put('/forgot-password', (req, res) => {
    const { username, password } = req.body;

    // Check if username exists
    const query = 'SELECT id FROM users WHERE username = ?';
    pool.query(query, [username], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Username not found' });
        }

        const userId = result[0].id;

        // Hash the new password
        bcrypt.hash(password, 10) // Use a cost factor of 10 (adjust as needed)
            .then(hash => {
                const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
                pool.query(updateQuery, [hash, userId], (err, _) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error resetting the password' });
                    }
                    res.status(200).json({ message: 'Password reset successfully' });
                });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error hashing the password' });
            });
    });
});

//#region Delete
router.delete('/delete', (req, res) => {
    const { username, admin, password } = req.query; // Using request body for input

    // Step 1: Check if the admin exists
    const checkAdminQuery = `
        SELECT password FROM users
        WHERE username = ? AND is_admin = true
    `;

    pool.query(checkAdminQuery, [admin], async (err, adminResult) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'An error occurred while checking the admin username.'
            });
        }

        // Check if the admin user exists
        if (adminResult.length === 0) {
            return res.status(404).json({
                message: 'Admin username not found or user is not an admin.'
            });
        }

        // Get the hashed admin password
        const hashedAdminPassword = adminResult[0].password;

        // Step 2: Verify the admin's password
        try {
            const passwordMatch = await bcrypt.compare(password, hashedAdminPassword);
            if (!passwordMatch) {
                return res.status(403).json({
                    message: 'Admin password is incorrect.'
                });
            }

            // Step 3: Check if the user to be deleted exists and get their image path
            const checkUserQuery = `
                SELECT id, image_path, is_admin FROM users
                WHERE username = ?
            `;

            pool.query(checkUserQuery, [username], (err, userResult) => {
                if (err) {
                    console.error(`Database error: ${err}`);
                    return res.status(500).json({
                        message: 'An error occurred while checking the user.'
                    });
                }

                // Check if the user exists
                if (userResult.length === 0) {
                    return res.status(404).json({
                        message: 'User not found.'
                    });
                }

                // Get user details
                const userId = userResult[0].id;
                const userImagePath = userResult[0].image_path;
                const userIsAdmin = userResult[0].is_admin;

                // Step 4: Delete the user
                const deleteUserQuery = `
                    DELETE FROM users
                    WHERE id = ?
                `;

                pool.query(deleteUserQuery, [userId], (err, deleteResult) => {
                    if (err) {
                        console.error(`Database error: ${err}`);
                        return res.status(500).json({
                            message: 'An error occurred while deleting the user.'
                        });
                    }

                    // Step 5: Delete the user's profile photo
                    if (userImagePath) {
                        const imagePath = path.join(__dirname, '..', userImagePath);
                        fs.unlink(imagePath, (err) => {
                            if (err) {
                                console.error(`Error deleting image: ${err}`);
                                return res.status(500).json({
                                    message: 'User deleted successfully, but failed to delete the image.'
                                });
                            }
                            // Successfully deleted the user and their image
                            return res.status(200).json({
                                message: 'User deleted successfully and image removed.'
                            });
                        });
                    } else {
                        // If there was no image path, just return success
                        return res.status(200).json({
                            message: 'User deleted successfully, but no image was found to delete.'
                        });
                    }
                });
            });
        } catch (error) {
            console.error(`Bcrypt error: ${error}`);
            return res.status(500).json({
                message: 'An error occurred while verifying the admin password.'
            });
        }
    });
});

//#endregion


module.exports = router;