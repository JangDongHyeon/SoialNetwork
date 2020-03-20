const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const passport = require('passport');
const app = express();
dotenv.config();

//db
connectDB();

//bring in routes
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

//middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);
app.use('/', postRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            error: 'Unauthorized!'
        });
    }
});

const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`A Node Js API is listening on port: ${port}`);
});
