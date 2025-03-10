import User from "../models/user";
import Course from "../models/course";

const stripe = require("stripe")(process.env.STRIPE_SECRET);
//import queryString from "query-string";

export const makeInstructor = async (req, res) => {
  console.log("itheydfgd");
  console.log("request coming from frontend", req.body);
  try {
    const { bankName, bankAcc, ifsc } = req.body;

    // validation

    if (!bankName || !bankAcc || !ifsc) {
      return res.status(400).send("Missing Information");
    }
    // if (!password || password.length < 6) {
    //   return res
    //     .status(400)
    //     .send("Password required and should be min 6 characters long");
    // }
    // let userExist = await User.findOne({ email }).exec();
    // if (userExist) {
    //   return res.status(400).send("Email is taken");
    // }
    // // hash password
    // const hashedPassword = await hashPassword(password);
    // //register
    const user = await User.findById(req.auth._id).exec();
    // const updated = await User.findOneAndUpdate(
    //   { user },
    //   {
    //     bankName: bankName,
    //     bankAcc: bankName,
    //     ifsc: ifsc,
    //   },
    //   {
    //     new: true,
    //   }
    // );
    const statusUpdated = await User.findByIdAndUpdate(
      user._id,
      {
        bankName: bankName,
        bankAcc: bankName,
        ifsc: ifsc,
        $addToSet: { role: "Instructor" },
      },
      { new: true }
    );
    //  await user.save();
    console.log("statusUpdated", statusUpdated);

    return res.json(statusUpdated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error ,Try again");
  }
  return;
  try {
    //1 find user from db
    const user = await User.findById(req.auth._id).exec();
    console.log(user);

    //2 if user dont have stripe_account_id yet then create new
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: "standard" });
      console.log("ACCOUNT", account.id);
      user.stripe_account_id = account.id;
      user.save();
    }
    console.log("user saved");
    // 3 create account link based upon account id (for frntenf to complete onboarding)
    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    });
    console.log(accountLink);
    //4 pre fill any info such as email {optional}
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });
    //5 then send link accpunt link to respoinse to frontend
    // res.send({ ok: true });

    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (err) {
    console.log(err);
    console.log("make instructor error");
  }
};

export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).exec();
    const account = await stripe.accounts.retrive(user.ripe_account_id);

    console.log("Account", account);
    if (!account.charges_enabled) {
      return res.status(401).send("Unauthorized");
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          $addToSet: { role: "Instructor" },
        },
        { new: true }
      )
        .select("-password")
        .exec();
      // statusUpdated.password =undefined
      res.json(statusUpdated);
    }
  } catch (err) {
    console.log(err);
  }
};

export const currentInstructor = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).select("-password").exec();
    if (!user.role.includes("Instructor")) {
      return res.sendStatus(403);
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};
export const instructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.auth._id })
      .sort({ createdAt: -1 })
      .exec();

    res.json(courses);
  } catch (err) {
    console.log(err);
  }
};

export const studentCount = async (req, res) => {
  try {
    const users = await User.find({ courses: req.body.courseId })
      .select("_id")
      .exec();

    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

export const instructorBalance = async () => {
  try {
    let user = await User.findById(req.auth._id).exec();
    const balance = await stripe.balance.retrive({
      stripeAccount: user.stripe_account_id,
    });
    res.json(balance);
  } catch (err) {
    console.log(err);
  }
};
