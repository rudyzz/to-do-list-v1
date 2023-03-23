const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

// Get current date
const date = require(__dirname + "/date.js");
const day = date.getDate();

app = express();

// For templating
app.set('view engine', 'ejs');

// For body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


// Using MongoDB

// Connect to MongoDB
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect("mongodb://localhost:27017/todolistDB");
}

// Define schema and model
const itemSchema = mongoose.Schema({
        name: String
    });
const Item = mongoose.model("Item", itemSchema);

const activity1 = new Item({ name: "Eat breakfast" });
const activity2 = new Item({ name: "Eat lunch" });
const activity3 = new Item({ name: "Eat dinner" });
const defaultItems = [activity1, activity2, activity3];


const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);


const insertItems = function(items) {
    try {
        Item.insertMany(items);
    } catch (error) {
        console.error(error);
    }
}

const findItems = async function() {
    try {
        const items = await Item.find({});
        return items;
    } catch (error) {
        console.error(error);
    }
}

// Get root page
app.get("/", async function (req, res) {

    let items = await findItems();
    if (items.length === 0) insertItems(defaultItems);
    items = await findItems();

    res.render("list", {listTitle: day, newListItems: items});
})

// Post a new item
app.post("/", async function(req, res) {
    const itemName = req.body.newItem;
    const item = new Item({name: itemName});

    const listName = await req.body.list;

    if (listName === day) {
        insertItems(item);
        res.redirect("/");
    } else {
        const foundList = await List.findOne({name: listName});
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    }

});

// Delete an item
app.post("/delete", async function(req, res) {
    const checkedItemId = await req.body.checkbox;
    const listName = await req.body.listName;

    console.log(listName);

    try {
        if (listName === day) {
            await Item.findByIdAndDelete(checkedItemId);
            res.redirect("/");
        }
        else {
            await List.findOneAndUpdate(
                {name: listName},
                {$pull: {items: {_id: checkedItemId}}}
            );
            res.redirect("/" + listName);
        }
    } catch (error) {
        console.log(error);
    }
    
});

// Get dynamic sub-page
app.get("/:customListName", async function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    
    // Check if the customized list already exists
    const foundList = await List.findOne({name: customListName});
    if (!foundList) {
        // Create a new List
        const list = new List({
            name: customListName,
            items: defaultItems
        });
        await list.save();
        res.redirect("/" + customListName);
    } else {
        // Render the sub-page
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    
});

// Get /about page
app.get("/about", function(req, res) {
    res.render("about");
});

// Listen on port 3000
app.listen( "3000", function (req, res) {
    console.log("Server is running on port 3000");
});
