const express = require("express");
const date = require(__dirname + "/date.js");

app = express();

// For templating
app.set('view engine', 'ejs');

// For body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

const items = ["Buy food", "Cook food", "Eat food"];
const workItems = [];

// Get root page
app.get("/", function (req, res) {
    const day = date.getDate();
    res.render("list", {listTitle: day, newListItems: items});
})

// Post a new item
app.post("/", function(req, res) {
    const item = req.body.newItem;

    if (req.body.list === "Work List") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item)
        res.redirect("/");
    }
})

// Get /work page
app.get("/work", function(req, res) {
    res.render("list", {listTitle: "Work List", newListItems: workItems})
})

// Get /about page
app.get("/about", function(req, res) {
    res.render("about");
})

// Listen on port 3000
app.listen( "3000", function (req, res) {
    console.log("Server is running on port 3000");
})
