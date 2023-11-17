const {MongoClient} = require("mongodb");

const uri = "mongodb+srv://phanvande2003:VanDex2003@sdfaf.ncrrtpe.mongodb.net/";
const client = new MongoClient(uri);

function connectMongoDB() {
    client.connect((err) => {
        if (err) {
            console.error("Error connecting to MongoDB:", err);
            return;
        }

        console.log("Connected to MongoDB");

        const dbName = "chatApp";

        const db = client.db(dbName);

        const messagesCollection = db.collection("messages");
        const imagesCollection = db.collection("images");

        // client.close();
    });
}

module.exports = {
    connectMongoDB,
};

connectMongoDB();
