const mongoose=require("mongoose");
require("dotenv").config();
const connectWithDb= ()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=> console.log("DB connection is successful"))
    .catch((error)=> {
        console.log("issue in DB connection");
        console.error(error.message);
        process.exit(1);
    });
}
module.exports=connectWithDb;