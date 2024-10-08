

import { connect } from "mongoose";


const dbConnect = async()=>{
    try {
        const mongoDbConnection=await connect(process.env.CONNECTION_STRING);
        console.log(`Database connection successful: ${mongoDbConnection.connection.host}`);
    } catch (error) {
        console.log(`Database connection error:${error}`)
        process.exit(1); // Exit the process with an error status
    
    }

}

export default dbConnect;