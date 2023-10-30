

const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

const connect = async () => {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    
};

module.exports = { connect };
