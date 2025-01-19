const mongoose = require('mongoose');
const connectDb = async () => {
    try {
        const conn  = await mongoose.connect(process.env.Mongodb_Url)
        console.log("connected to mongodb on host: " + conn.connection.host)
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = connectDb;
