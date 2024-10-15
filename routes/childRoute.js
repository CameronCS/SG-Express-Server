//#region Requires
// Global Requires
const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')
// Local Requires
const pool = require('../services/DB')
const upload = require('../middleware/MulterChild')
//#endregion Requires

//#region Consts
const router = express.Router()
//#endregion

router.get('/', (req, res) => {
    res.send('Child Root')
})


//#region POST
router.post('/add', upload.single('image'), (req, res) => {
    const {
        first_name,
        last_name,
        class_name,
        notes
    } = req.body;


    const {
        parent1,
        parent2
    } = req.query;

    // Check if an image was uploaded
    const imagePath = req.file ? `/uploads/child/${req.file.filename}` : null;

    // Step 1: Add child details to the child table
    const addChildQuery = `
        INSERT INTO child (first_name, last_name, class_name, image_path, notes)
        VALUES (?, ?, ?, ?, ?)
    `;

    pool.query(addChildQuery, [first_name, last_name, class_name, imagePath, notes], (err, result) => {
        if (err) {
            console.error(`Database error while adding child: ${err}`);
            return res.status(500).json({ message: 'An error occurred while adding the child.' });
        }

        const childId = result.insertId; // Get the ID of the newly created child

        // Step 2: If parent usernames are provided, get their IDs and insert into child_parent table
        const parentUsernames = [parent1, parent2].filter(Boolean); // Filter out any undefined or null values
        if (parentUsernames.length > 0) {
            const getParentIdsQuery = `
                SELECT id FROM users
                WHERE username IN (?)
            `;

            pool.query(getParentIdsQuery, [parentUsernames], (err, parentResults) => {
                if (err) {
                    console.error(`Database error while retrieving parent IDs: ${err}`);
                    return res.status(500).json({ message: 'An error occurred while retrieving parent IDs.' });
                }

                // Step 3: Add parent-child associations
                const insertChildParentQuery = `
                    INSERT INTO child_parent (c_id, u_id)
                    VALUES ?
                `;

                const childParentValues = parentResults.map(parent => [childId, parent.id]);

                if (childParentValues.length > 0) {
                    pool.query(insertChildParentQuery, [childParentValues], (err) => {
                        if (err) {
                            console.error(`Database error while adding child-parent associations: ${err}`);
                            return res.status(500).json({ message: 'An error occurred while associating the child with parents.' });
                        }
                        // Success response after adding child and parent associations
                        res.status(201).json({ message: 'Child added successfully with parent associations.' });
                    });
                } else {
                    // If no valid parents found to associate, just respond with success
                    res.status(201).json({ message: 'Child added successfully but no valid parent associations were made.' });
                }
            });
        } else {
            // If no parents provided, respond with success
            res.status(201).json({ message: 'Child added successfully but no parent associations were made.' });
        }
    });
});

router.post('/add-parent', (req, res) => {
    const { child_f_name, child_l_name, parent_username } = req.body;

    // Step 1: Retrieve Child ID
    const getChildQuery = `
        SELECT id, last_name FROM child
        WHERE first_name = ? AND last_name = ?
    `;

    pool.query(getChildQuery, [child_f_name, child_l_name], (err, childResults) => {
        if (err) {
            console.error(`Database error while retrieving child: ${err}`);
            return res.status(500).json({ message: 'An error occurred while retrieving the child.' });
        }

        if (childResults.length === 0) {
            return res.status(404).json({ message: 'Child not found.' });
        }

        const childId = childResults[0].id;
        const childLastName = childResults[0].last_name;

        // Step 2: Retrieve Parent ID
        const getParentQuery = `
            SELECT id, last_name FROM users
            WHERE username = ?
        `;

        pool.query(getParentQuery, [parent_username], (err, parentResults) => {
            if (err) {
                console.error(`Database error while retrieving parent: ${err}`);
                return res.status(500).json({ message: 'An error occurred while retrieving the parent.' });
            }

            if (parentResults.length === 0) {
                return res.status(404).json({ message: 'Parent not found.' });
            }

            const parentId = parentResults[0].id;
            const parentLastName = parentResults[0].last_name;

            // Check if last names match
            if (childLastName !== parentLastName) {
                return res.status(400).json({ message: 'Last names do not match. Association cannot be created.' });
            }

            // Step 3: Check for existing association
            const checkAssociationQuery = `
                SELECT * FROM child_parent
                WHERE c_id = ? AND u_id = ?
            `;

            pool.query(checkAssociationQuery, [childId, parentId], (err, associationResults) => {
                if (err) {
                    console.error(`Database error while checking association: ${err}`);
                    return res.status(500).json({ message: 'An error occurred while checking the association.' });
                }

                // If the association already exists
                if (associationResults.length > 0) {
                    return res.status(409).json({ message: 'This parent-child association already exists.' });
                }

                // Step 4: Insert new association
                const insertAssociationQuery = `
                    INSERT INTO child_parent (c_id, u_id)
                    VALUES (?, ?)
                `;

                pool.query(insertAssociationQuery, [childId, parentId], (err) => {
                    if (err) {
                        console.error(`Database error while adding association: ${err}`);
                        return res.status(500).json({ message: 'An error occurred while adding the association.' });
                    }

                    // Successful response
                    res.status(201).json({ message: 'Parent-child association created successfully.' });
                });
            });
        });
    });
});
//#endregion POST

//#region GET
router.get('/get', (req, res) => {
    const { username } = req.query;

    // Step 1: Retrieve Parent ID
    const getParentIdQuery = `
        SELECT id FROM users
        WHERE username = ?
    `;

    pool.query(getParentIdQuery, [username], (err, parentResults) => {
        if (err) {
            console.error(`Database error while retrieving parent ID: ${err}`);
            return res.status(500).json({ message: 'An error occurred while retrieving the parent ID.' });
        }

        if (parentResults.length === 0) {
            return res.status(404).json({ message: 'Parent not found.' });
        }

        const parentId = parentResults[0].id;

        // Step 2: Retrieve Child IDs
        const getChildIdsQuery = `
            SELECT c_id FROM child_parent
            WHERE u_id = ?
        `;

        pool.query(getChildIdsQuery, [parentId], (err, childIdResults) => {
            if (err) {
                console.error(`Database error while retrieving child IDs: ${err}`);
                return res.status(500).json({ message: 'An error occurred while retrieving child IDs.' });
            }

            if (childIdResults.length === 0) {
                return res.status(404).json({ message: 'No children found for this parent.' });
            }

            // Extracting child IDs
            const childIds = childIdResults.map(row => row.c_id);

            // Step 3: Retrieve Child Details
            const getChildrenDetailsQuery = `
                SELECT * FROM child
                WHERE id IN (?)
            `;

            // Using a prepared statement for the child IDs
            pool.query(getChildrenDetailsQuery, [childIds], (err, childrenResults) => {
                if (err) {
                    console.error(`Database error while retrieving children details: ${err}`);
                    return res.status(500).json({ message: 'An error occurred while retrieving children details.' });
                }

                // Step 4: Sending Response
                if (childrenResults.length === 0) {
                    return res.status(404).json({ message: 'No details found for the children.' });
                }

                res.status(200).json({
                    children: childrenResults,
                    message: 'Children retrieved successfully.'
                });
            });
        });
    });
});

router.get('/get-all', (req, res) => {
    const { admin_username } = req.query;

    // Step 1: Retrieve All Children (removed admin check)
    const getAllChildrenQuery = `
        SELECT * FROM child
    `;

    pool.query(getAllChildrenQuery, (err, childrenResults) => {
        if (err) {
            console.error(`Database error while retrieving all children: ${err}`);
            return res.status(500).json({ message: 'An error occurred while retrieving children.' });
        }

        // Step 2: Sending Response
        if (childrenResults.length === 0) {
            return res.status(404).json({ message: 'No children found in the database.' });
        }

        res.status(200).json({
            children: childrenResults,
            message: 'Children retrieved successfully.'
        });
    });
});

//#endregion

//#region PUT
router.put('/edit-notes', (req, res) => {
    const { child_f_name, child_l_name, notes } = req.body; // Include notes in the request body
    const { admin_username } = req.query;

    // Step 1: Check if Admin Exists
    const checkAdminQuery = `
        SELECT id FROM users
        WHERE username = ? AND is_admin = true
    `;

    pool.query(checkAdminQuery, [admin_username], (err, adminResults) => {
        if (err) {
            console.error(`Database error while checking admin status: ${err}`);
            return res.status(500).json({ message: 'An error occurred while checking admin status.' });
        }

        // Check if admin was found
        if (adminResults.length === 0) {
            return res.status(403).json({ message: 'Access denied. User is not an admin.' });
        }

        // Step 2: Retrieve Child ID
        const getChildIdQuery = `
            SELECT id, notes FROM child
            WHERE first_name = ? AND last_name = ?
        `;

        pool.query(getChildIdQuery, [child_f_name, child_l_name], (err, childResults) => {
            if (err) {
                console.error(`Database error while retrieving child ID: ${err}`);
                return res.status(500).json({ message: 'An error occurred while retrieving child details.' });
            }

            // Check if child was found
            if (childResults.length === 0) {
                return res.status(404).json({ message: 'Child not found.' });
            }

            const childId = childResults[0].id;
            const currentNotes = childResults[0].notes;

            // Step 3: Prepare new notes
            let newNotes;
            if (currentNotes === 'N/A') {
                newNotes = notes; // Overwrite with new notes if current notes are 'N/A'
            } else {
                newNotes = `${currentNotes}\n${notes}`; // Append new notes
            }

            // Step 4: Update notes in the database
            const updateNotesQuery = `
                UPDATE child
                SET notes = ?
                WHERE id = ?
            `;

            pool.query(updateNotesQuery, [newNotes, childId], (err, updateResult) => {
                if (err) {
                    console.error(`Database error while updating notes: ${err}`);
                    return res.status(500).json({ message: 'An error occurred while updating notes.' });
                }

                // Step 5: Sending Response
                res.status(200).json({
                    message: 'Notes updated successfully.'
                });
            });
        });
    });
});
//#endregion

//#region Delete
router.delete('/delete', (req, res) => {
    const { child_f_name, child_l_name, admin_username, admin_password } = req.body;

    // Step 1: Check if the Admin is Valid
    const checkAdminQuery = `
        SELECT id, password FROM users
        WHERE username = ? AND is_admin = true
    `;

    pool.query(checkAdminQuery, [admin_username], (err, adminResults) => {
        if (err) {
            console.error(`Database error while checking admin status: ${err}`);
            return res.status(500).json({ message: 'An error occurred while checking admin status.' });
        }

        // Check if admin was found
        if (adminResults.length === 0) {
            return res.status(403).json({ message: 'Access denied. User is not an admin.' });
        }

        const admin = adminResults[0];

        // Step 2: Verify Admin Password
        const isPasswordValid = bcrypt.compareSync(admin_password, admin.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: 'Invalid admin password.' });
        }

        // Step 3: Check if the Child Exists
        const getChildIdQuery = `
            SELECT id, image_path FROM child
            WHERE first_name = ? AND last_name = ?
        `;

        pool.query(getChildIdQuery, [child_f_name, child_l_name], (err, childResults) => {
            if (err) {
                console.error(`Database error while retrieving child details: ${err}`);
                return res.status(500).json({ message: 'An error occurred while retrieving child details.' });
            }

            // Check if child was found
            if (childResults.length === 0) {
                return res.status(404).json({ message: 'Child not found.' });
            }

            const childId = childResults[0].id;
            const childImagePath = childResults[0].image_path;

            // Step 4: Delete the Child-Parent Association
            const deleteChildParentQuery = `
                DELETE FROM child_parent
                WHERE c_id = ?
            `;

            pool.query(deleteChildParentQuery, [childId], (err) => {
                if (err) {
                    console.error(`Database error while deleting child-parent association: ${err}`);
                    return res.status(500).json({ message: 'An error occurred while deleting the child-parent association.' });
                }

                // Step 5: Delete the Child Record
                const deleteChildQuery = `
                    DELETE FROM child
                    WHERE id = ?
                `;

                pool.query(deleteChildQuery, [childId], (err, deleteResult) => {
                    if (err) {
                        console.error(`Database error while deleting child: ${err}`);
                        return res.status(500).json({ message: 'An error occurred while deleting the child.' });
                    }

                    // Step 6: Delete the child's image from the uploads directory
                    if (childImagePath) {
                        const imagePath = path.join(__dirname, '..', childImagePath);
                        fs.unlink(imagePath, (err) => {
                            if (err) {
                                console.error(`Error deleting image file: ${err}`);
                            }
                            // Respond to the client
                            res.status(200).json({ message: 'Child and associations deleted successfully.' });
                        });
                    } else {
                        // No image to delete, respond to the client
                        res.status(200).json({ message: 'Child deleted successfully, no image found.' });
                    }
                });
            });
        });
    });
});


//#endregion

module.exports = router