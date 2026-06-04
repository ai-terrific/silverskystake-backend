import User from "../models/user";
export const addUser = (req, res) => {
    let newUser = new User(req.body);
    newUser.save().then(() => {
        res.send({ state: 1, msg: "New User Created." });
    });
};
