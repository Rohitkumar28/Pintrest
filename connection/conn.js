const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config() ;

const connection = async () => {
    try {
        mongoose.connect(process.env.URL);
        console.log("connected");
    } catch (error) {
        console.log("Error :" + error);
    }
}

connection();