require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express()


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Ritesh_Ranka:process.env.PASSWORD@cluster0.yi94a.mongodb.net/userDB",{ useNewUrlParser: true,useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    email: String,
    password: String,
});

const ngoSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    phone: Number,
    description: String,
    adress1: String,
    adress2: String,
    country: String,
    state: String,
    zip: Number,
    status: Number,
});

const transSchema = new mongoose.Schema({
    username: String,
    ngoname: String,
    amount: Number,
    date: String,
    status: String,
    message: String,
});

const User = mongoose.model("User", userSchema);
const Ngo = mongoose.model("Ngo",ngoSchema);
const Trans = mongoose.model("trans",transSchema);

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 
if(mm<10) 
{
    mm='0'+mm;
}
today = dd+'/'+mm+'/'+yyyy;

app.get("/", function(req, res){
    res.render("index");
});

app.get("/instagram",function(req,res){
    res.redirect("https://www.instagram.com/r.it_esh");
});

app.get("/linkedin",function(req,res){
    res.redirect("https://linkedin.com/in/ritesh-ranka-b55a871a4");
});

app.get("/twitter",function(req,res){
    res.redirect("https://twitter.com/Ritesh82223581");
});


app.get("/features", function(req, res){
    res.render("features");
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/contact", function(req, res){
    res.render("contact");
});

app.get("/details", function(req, res){
    res.render("details");
});

app.get("/userReg",function(req,res){
    let errors=[];
    res.render("userReg",{errors:errors});
});

app.get("/login/:type", function(req,res){
    let errors =[];
    if(req.params.type==="user")
        res.render("loginuser",{type:"User",name:"Username",errors:errors});
    else
        res.render("loginuser",{type: "NGO", name: "NGOname",errors:errors});
});

app.get("/trans/:ngoname",function(req,res){
    console.log(req.params.ngoname);
    Trans.find(function(error,trans){
        if(error){
            console.log("Something went wrrong");
        }else{
            res.render("allTransactionn",{ngoname:req.params.ngoname,trans,type: "ngo"});
        }
    });
});

app.get("/transaction/:username",function(req,res){
    console.log(req.params.username);
    Trans.find(function(error,trans){
        if(error){
            console.log("Something went wrrong");
        }else{
            res.render("allTransaction",{username:req.params.username,trans,type: "user"});
        }
    });
});

app.post("/loginuser", function(req, res){
    let errors =[];
    if(req.body.User==="u")
        res.render("loginuser",{type:"User",name:"Username",errors});
    else
        res.render("loginuser",{type:"NGO", name:"NGOname",errors});
});

app.post("/transaction",function(req,res){
    console.log(req.body.amount);
    console.log(req.body.username);
    console.log(req.body.ngoname);
    console.log(today);
    const sta = 0;
    const mess = "";
    console.log(mess);
    console.log(sta);
    const trans = new Trans({
        username: req.body.username,
        ngoname: req.body.ngoname,
        amount: req.body.amount,
        date: today,
        status: "Sent",
        message: mess,
    });
    trans.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Registered");
            res.render("broadMsg",{msg:"Transaction Completed"});
        }
    });
});

app.post("/login", function(req, res){
    let errors = [];
    const {username, password, button} = req.body;
    if(!username || !password){
        errors.push({msg: "Please enter all fields."});
        res.render("loginuser",{
            type: button,
            name: button+"name",
            errors,
        });
    }
    else if(req.body.button==="User")
    {
        User.findOne({username:req.body.username},function(err,user){
            if(err){
                console.log("Something went wrong or Account not found");
                errors.push({msg: "Something went wrong. Try again."});
                res.render("loginuser",{
                    type:"User",
                    name:"Username",
                    errors,
                });
            }else{
                if(user){
                    bcrypt.compare(req.body.password, user.password, function(err, result){
                        if(err){
                            console.log(err);
                        }
                        else if(result===true)
                        {
                            console.log("Logged in successfully");
                            Ngo.find(function(error,ngo){
                                if(error){
                                    errors.push({msg: "something went wrong"});
                                }else{
                                    res.render("welcome",{type: "User",user,ngos: ngo});
                                }
                            });
                            //console.log(ngos);
                           
                        }else{
                            console.log("Incorrect password");
                            errors.push({msg: "Incorrect password."});
                            res.render("loginuser",{
                                type:"User",
                                name:"Username",
                                errors,
                            });
                        } 
                    });
                }else{
                    console.log("Account not found");
                    errors.push({msg: "Account not found. Register Yourself."});
                    res.render("loginuser",{
                        type:"User",
                        name:"Username",
                        errors,
                    });
                }
            }
        });
    }else{
        Ngo.findOne({username:req.body.username},function(err,user){
            if(err){
                console.log("Something went wrong or Account not found");
                errors.push({msg: "Something went wrong. Try again."});
                res.render("loginuser",{
                    type:"NGO",
                    name:"NGOname",
                    errors,
                });
            }else{
                if(user){
                    bcrypt.compare(req.body.password, user.password, function(err, result){
                        if(err){
                            console.log(err);
                        }
                        else if(result===true)
                        {
                            if(user.status==0){
                                errors.push({msg: "Not Yet verified."});
                                res.render("loginuser",{
                                    type:"NGO",
                                    name:"NGOname",
                                    errors,
                                }); 
                            }else{
                            console.log("Logged in successfully");
                            Trans.find(function(err,trans){
                                if(err){
                                    console.log(err);
                                }else{
                                   res.render("ngoTransactions",{ngoname: user.username,trans,today}) 
                                }
                            });
                            }
                        }else{
                            console.log("Incorrect password");
                            errors.push({msg: "Incorrect password."});
                            res.render("loginuser",{
                                type:"NGO",
                                name:"NGOname",
                                errors,
                            });
                        } 
                    });
                }else{
                    console.log("Account not found");
                    errors.push({msg: "Account not found. Register Yourself."});
                    res.render("loginuser",{
                        type:"NGO",
                        name:"NGOname",
                        errors,
                    });
                }
            }
        });
    }
});

app.post("/register",function(req,res){

    const {username, fullname, email, password, password1} = req.body;
    let errors = [];
    if(!username || !password || !email || !fullname || !password1){
        errors.push({msg: "Please enter all details."});
        res.render("userReg",{errors});
    }  
    else if(password1!=password){
        errors.push({msg: "Password not matched"});
        if(password.length < 8)
            errors.push({msg: "Password must be at least 6 characters."});
        res.render("userReg",{errors});
    } 
    else{
        User.findOne({username:req.body.username},function(err,user1){
            if(err){
                console.log("Something went wrong or Account not found");
            }else if(user1){
                console.log("Username already exists");
                errors.push({msg: "Username already exists. Try something else."});
                res.render("userReg",{errors});
            }
            else{
                bcrypt.hash(req.body.password, saltRounds, function(err, hash){
                    if(err){
                        console.log(err);
                    }else{
                        const user =  new User({
                            username: req.body.username,
                            fullname: req.body.fullname,
                            email: req.body.email,
                            password: hash,
                        });
                        
                        user.save(function(err){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("Registered");
                                res.render("loginuser",{type:"User",name:"Username"});
                            }
                        });
                        
                    }
                });
            }
        });
    }
});

app.post("/loginngo", function(req, res){

    let errors = [];
    Ngo.findOne({username:req.body.username},function(err,user1){
        if(err){
            console.log("Something went wrong. Please try again.");
            errors.push({msg: "NGO name already exists."});
            res.render("details",{errors});
        }else if(user1){
            console.log("NGO name already exists");
            errors.push({msg: "NGO name already exists."});
            res.render("details",{errors});
        }
        else{
            bcrypt.hash(req.body.password, saltRounds, function(err,hash){
                if(err){
                    console.log(err);
                }else{
                    const user =  new Ngo({
                        username: req.body.username,
                        password: hash,
                        email: req.body.email,
                        phone: req.body.phoneNo,
                        description: req.body.description,
                        adress1: req.body.adress1,
                        adress2:req.body.adress2,
                        country: req.body.country,
                        state: req.body.state,
                        zip: req.body.zip,
                        status: 0,
                    });
                    
                    user.save(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("Registered");
                            res.render("broadMsg",{msg: "Thanks for registering. Please wait for the confirmation Email."});
                        }
                    });
                }
            }); 
        }
    });
});


app.listen(process.env.PORT || 3000, function(){
    console.log("Server started at port 3000");
});