const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config()

const app = express();
app.use(bodyParser.json()); // to parse JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to parse URL-encoded bodies


const ADDR = process.env.IP_ADDR_CAM;
// const ADDR = process.env.IP_ADDR_CAMP;
const PORT = 3000;

// Define the path to the static files directory
const staticPath = path.join(__dirname, 'uploads');

// Serve static files from the `pics` directory
app.use('/uploads', express.static(staticPath));

app.get('/', (req, res) => {
    res.send(`Server on http://${ADDR}:${PORT}`)
})


//#region Routers
const userRoute = require('./routes/userRoute')
const childRoute = require('./routes/childRoute')
const emailRoute = require('./routes/emailRoute')
const calendarRoute = require('./routes/calendarRoute')
const newsletterRoute = require('./routes/newsletterRoute')
const galleryRoute = require('./routes/galleryRoute')
const resourceRoute = require('./routes/resourceRoute')

app.use('/users', userRoute)
app.use('/child', childRoute)
app.use('/emails', emailRoute)
app.use('/calendar', calendarRoute)
app.use('/newsletters', newsletterRoute)
app.use('/gallery', galleryRoute)
app.use('/resources', resourceRoute)
//#endregion

app.listen(PORT, ADDR, () => {
    console.log(`===============================================================================================================`);
    console.log(`===============================================SG-SERVER-API===================================================`);
    console.log(`===============================================================================================================`);
    console.log(`Server running on http://${ADDR}:${PORT}`);
    console.log(`---------------------------------------------------------------------------------------------------------------`);
    console.log(`Server Routes`);
    console.log(`User Route         : http://${ADDR}:${PORT}/users/`);
    console.log(`Child Route        : http://${ADDR}:${PORT}/child/`);
    console.log(`Email Route        : http://${ADDR}:${PORT}/emails/`);
    console.log(`Calendar Route     : http://${ADDR}:${PORT}/calendar/`);
    console.log(`Newsletter Route   : http://${ADDR}:${PORT}/newsletters/`);
    console.log(`Gallery Route      : http://${ADDR}:${PORT}/gallery/`);
    console.log(`Resource Route     : http://${ADDR}:${PORT}/resources/`);
    console.log(`---------------------------------------------------------------------------------------------------------------`);
    console.log(`===============================================================================================================`);
    console.log(`==================================================User Routes==================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Create User              -> http://${ADDR}:${PORT}/users/add`);
    console.log(`Login                    -> http://${ADDR}:${PORT}/users/login`);
    console.log(`-----------------------------------------------------GET-------------------------------------------------------`);
    console.log(`Check Username Available -> http://${ADDR}:${PORT}/users/check-username-available?username=qry`);
    console.log(`Search All Usernames     -> http://${ADDR}:${PORT}/users/all-usernames?searching=qry`);
    console.log(`Search Specific Username -> http://${ADDR}:${PORT}/users/search-specific?searching=qry&username_query=qry`);
    console.log(`-----------------------------------------------------PUT-------------------------------------------------------`);
    console.log(`Reset Password           -> http://${ADDR}:${PORT}/users/reset-password`);
    console.log(`-----------------------------------------------------DELETE----------------------------------------------------`);
    console.log(`Delete User              -> http://${ADDR}:${PORT}/users/delete`);
    console.log(`=================================================Child Routes==================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Add Child                -> http://${ADDR}:${PORT}/child/add?parent1=qry&parent2=qry`);
    console.log(`Add Parent               -> http://${ADDR}:${PORT}/child/add-parent`);
    console.log(`-----------------------------------------------------GET-------------------------------------------------------`);
    console.log(`Get Children for Parent  -> http://${ADDR}:${PORT}/child/get?username=qry`);
    console.log(`Get All Children         -> http://${ADDR}:${PORT}/child/get-all?username=qry`);
    console.log(`-----------------------------------------------------PUT-------------------------------------------------------`);
    console.log(`Edit Child Notes         -> http://${ADDR}:${PORT}/child/edit-notes?admin_username=qry`);
    console.log(`-----------------------------------------------------DELETE----------------------------------------------------`);
    console.log(`Delete Child             -> http://${ADDR}:${PORT}/child/delete?username=qry&admin=qry&password=qry`);
    console.log(`================================================Email Routes===================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Send Email               -> http://${ADDR}:${PORT}/emails/send`);
    console.log(`-----------------------------------------------------GET-------------------------------------------------------`);
    console.log(`Get Emails               -> http://${ADDR}:${PORT}/emails/get?receiver_username=qry`);
    console.log(`Search Emails            -> http://${ADDR}:${PORT}/emails/search?param=qry&search=qry&username=qry`);
    console.log(`-----------------------------------------------------PUT-------------------------------------------------------`);
    console.log(`Update Status            -> http://${ADDR}:${PORT}/emails/update-status?msg_id=qry&username=qry&status=qry`);
    console.log(`-----------------------------------------------------DELETE----------------------------------------------------`);
    console.log(`Delete Email             -> http://${ADDR}:${PORT}/emails/delete`);
    console.log(`===============================================Calendar Routes=================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Add Calendar Event       -> http://${ADDR}:${PORT}/calendar/add`);
    console.log(`------------------------------------------------------GET------------------------------------------------------`);
    console.log(`Get Calendar Events      -> http://${ADDR}:${PORT}/calendar/get`);
    console.log(`==============================================Newsletter Routes================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Add newsletter           -> http://${ADDR}:${PORT}/newsletters/add`);
    console.log(`-----------------------------------------------------GET-------------------------------------------------------`);
    console.log(`Get newsletters          -> http://${ADDR}:${PORT}/newsletters/get`);
    console.log(`===============================================Gallery Routes==================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Add Gallery Image        -> http://${ADDR}:${PORT}/gallery/add`);
    console.log(`-----------------------------------------------------GET-------------------------------------------------------`);
    console.log(`Get Gallery Images       -> http://${ADDR}:${PORT}/gallery/get?year=qry`);
    console.log(`Get Gallery Images       -> http://${ADDR}:${PORT}/gallery/get-years`);
    console.log(`===============================================Resource Routes=================================================`);
    console.log(`-----------------------------------------------------POST------------------------------------------------------`);
    console.log(`Add Resources            -> http://${ADDR}:${PORT}/resources/add`);
    console.log(`-----------------------------------------------------GET-------------------------------------------------------`);
    console.log(`Get Resources            -> http://${ADDR}:${PORT}/resources/get?type=qry`);
    console.log(`===============================================================================================================`);
    console.log(`---------------------------------------------------------------------------------------------------------------`); 
    console.log(`----------------------------------------------------SERVICES---------------------------------------------------`);
    console.log(`---------------------------------------------------------------------------------------------------------------`); 
});
