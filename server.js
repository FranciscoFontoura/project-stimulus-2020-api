var express = require('express');
var app = express();
var db = require('./database');
var md5 = require("md5")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 5000;

app.listen(HTTP_PORT, () => {
    console.log("server running on port 5000")
});

app.get("/", (req, res, next) => {
    res.json({"message":"ok"})
});

app.get('/api/users', (req,res,next)=>{
    var sql = 'select * from user';
    var params = [];
    db.all(sql, params, (err,rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data": rows
        });
    });
});

app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

app.post("/api/user/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.get("/api/validateuser", (req, res, next) => {
    var errors=[]
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql = "select password from user where email = ?"
    var params = [data.email]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (data.password === row.password) {
            res.json({
                "message": "success"
            })
        } else {
            res.json({
                "message": "password dont match",
            })
        }
      });
});

app.use(function(req,res) {
    res.status(404);
});