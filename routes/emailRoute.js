const express = require('express')

const pool = require('../services/DB')

const router = express.Router()


//#region  POST
router.post('/send', (req, res) => {
    const { sender_username, receiver_username, subject, body } = req.body;

    if (!sender_username || !receiver_username || !subject || !body) {
        return res.status(400).json({
            message: 'All fields (sender, receiver, subject, body) are required.'
        });
    }

    // Query to check both usernames
    const checkUsersQuery = `
        SELECT username FROM users 
        WHERE username IN (?, ?)
    `;

    pool.query(checkUsersQuery, [sender_username, receiver_username], (err, results) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'There was an error verifying users.'
            });
        }

        if (results.length < 2) {
            return res.status(404).json({
                message: 'Either the sender or receiver username is not valid.'
            });
        }

        // If both usernames are valid, insert the email into the emails table
        const insertEmailQuery = `
            INSERT INTO emails (sender_username, receiver_username, subject, body, status) 
            VALUES (?, ?, ?, ?, 'unread')
        `;

        pool.query(insertEmailQuery, [sender_username, receiver_username, subject, body], (err, result) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    message: 'There was an error sending the email.'
                });
            }

            res.status(200).json({
                message: 'Email sent successfully.'
            });
        });
    });
});

//#endregion POST

//#region GET
router.get('/get', (req, res) => {
    const { receiver_username } = req.query;

    if (!receiver_username) {
        return res.status(400).json({
            message: 'Receiver username is required.'
        });
    }

    // Query to check if the receiver exists in the users table
    const checkReceiverQuery = `
        SELECT username FROM users 
        WHERE username = ?
    `;

    pool.query(checkReceiverQuery, [receiver_username], (err, result) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'There was an error verifying the receiver.'
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Receiver username does not exist.'
            });
        }

        // If the receiver exists, retrieve all emails sent to them
        const getEmailsQuery = `
            SELECT * FROM emails 
            WHERE receiver_username = ? Order By DESC
        `;

        pool.query(getEmailsQuery, [receiver_username], (err, emails) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    message: 'There was an error retrieving emails.'
                });
            }

            if (emails.length === 0) {
                return res.status(404).json({
                    message: 'No emails found for this receiver.'
                });
            }

            res.status(200).json({
                emails: emails,
                message: 'Emails retrieved successfully.'
            });
        });
    });
});

router.get('/search', (req, res) => {
    const { param, search, username } = req.query;

    if (!param || !search || !username) {
        return res.status(400).json({
            message: 'Param, search, and username are required fields.'
        });
    }

    // Ensure that 'param' is valid ('subject', 'body', or 'sender')
    const validParams = ['subject', 'body', 'sender'];
    if (!validParams.includes(param)) {
        return res.status(400).json({
            message: 'Invalid search parameter. Must be "subject", "body", or "sender".'
        });
    }

    // Query to check if the receiver exists in the users table
    const checkReceiverQuery = `
        SELECT username FROM users 
        WHERE username = ?
    `;

    pool.query(checkReceiverQuery, [username], (err, result) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'There was an error verifying the receiver.'
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Receiver username does not exist.'
            });
        }

        // Adjust the field to query based on the provided param
        let column;
        if (param === 'sender') {
            column = 'sender_username';
        } else {
            column = param;
        }

        // Query to search emails based on the param (subject, body, or sender)
        const searchEmailsQuery = `
            SELECT * FROM emails 
            WHERE receiver_username = ? 
            AND ${column} LIKE ?
        `;

        pool.query(searchEmailsQuery, [username, `%${search}%`], (err, emails) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    message: 'There was an error retrieving emails.'
                });
            }

            if (emails.length === 0) {
                return res.status(404).json({
                    message: `No emails found where ${param} contains "${search}".`
                });
            }

            res.status(200).json({
                emails: emails,
                message: 'Emails retrieved successfully.'
            });
        });
    });
});

//#endregion

//#region PUT
router.put('/update-status', (req, res) => {
    const { msg_id, username, status } = req.query;

    // Check if status is valid
    const validStatuses = ['unread', 'read', 'archived'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Invalid status. Must be "unread", "read", or "archived".'
        });
    }

    // Query to check if the username exists in the users table
    const checkUserQuery = `
        SELECT username FROM users 
        WHERE username = ?
    `;

    pool.query(checkUserQuery, [username], (err, result) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'Error verifying username.'
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Username does not exist.'
            });
        }

        // Query to check if the message exists and belongs to the username (receiver)
        const checkMsgQuery = `
            SELECT * FROM emails 
            WHERE id = ? AND receiver_username = ?
        `;

        pool.query(checkMsgQuery, [msg_id, username], (err, msgResult) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    message: 'Error retrieving message.'
                });
            }

            if (msgResult.length === 0) {
                return res.status(404).json({
                    message: 'No matching message found for the provided user and message ID.'
                });
            }

            // Update the status of the message
            const updateStatusQuery = `
                UPDATE emails 
                SET status = ? 
                WHERE id = ? AND receiver_username = ?
            `;

            pool.query(updateStatusQuery, [status, msg_id, username], (err, updateResult) => {
                if (err) {
                    console.error(`Database error: ${err}`);
                    return res.status(500).json({
                        message: 'Error updating message status.'
                    });
                }

                res.status(200).json({
                    message: 'Message status updated successfully.'
                });
            });
        });
    });
});
//#endregion

//#region Delete
router.delete('/delete', (req, res) => {
    const { msg_id, receiver_username } = req.body;

    // Check if the receiver username exists in the users table
    const checkUserQuery = `
        SELECT username FROM users 
        WHERE username = ?
    `;

    pool.query(checkUserQuery, [receiver_username], (err, userResult) => {
        if (err) {
            console.error(`Database error: ${err}`);
            return res.status(500).json({
                message: 'Error checking receiver username.'
            });
        }

        if (userResult.length === 0) {
            return res.status(404).json({
                message: 'Receiver username does not exist.'
            });
        }

        // Check if the message with the provided ID exists and belongs to the receiver
        const checkMsgQuery = `
            SELECT * FROM emails 
            WHERE id = ? AND receiver_username = ?
        `;

        pool.query(checkMsgQuery, [msg_id, receiver_username], (err, msgResult) => {
            if (err) {
                console.error(`Database error: ${err}`);
                return res.status(500).json({
                    message: 'Error retrieving the message.'
                });
            }

            if (msgResult.length === 0) {
                return res.status(404).json({
                    message: 'No matching message found for the provided user and message ID.'
                });
            }

            // Delete the message if it exists
            const deleteMsgQuery = `
                DELETE FROM emails 
                WHERE id = ? AND receiver_username = ?
            `;

            pool.query(deleteMsgQuery, [msg_id, receiver_username], (err, deleteResult) => {
                if (err) {
                    console.error(`Database error: ${err}`);
                    return res.status(500).json({
                        message: 'Error deleting the message.'
                    });
                }

                res.status(200).json({
                    message: 'Message deleted successfully.'
                });
            });
        });
    });
});

//#endregion

module.exports = router;