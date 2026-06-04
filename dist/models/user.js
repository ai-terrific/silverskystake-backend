import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema({
    u_id: {
        type: String,
        require: true,
        unique: true,
    },
    u_name: String,
    u_gender: String,
    u_birthday: String,
});
const User = mongoose.model("User", userSchema);
export default User;
