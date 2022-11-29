const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

let arabicDate = getArDay();

app.set("view engine", "ejs");
//search in view folder
const CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
const url = "mongodb+srv://bayanOmar:Aq7k8Ne0AhNEXEd5@bayanomar.dvhl0au.mongodb.net/todoDB";

//mongoDB
mongoose.connect(url,CONFIG);

const defTitle = "الرئيسية";

const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("item", itemSchema);

// const checkedSchema =new mongoose.Schema({name: String})
const checkedItem = mongoose.model("checkedItem", itemSchema);

const i1 = new Item({ name: "أهلًا بك!" });
const i2 = new Item({ name: "اضغط على + لإضافة جديد" });
const i3 = new Item({ name: "<--  اضغط هنا لحذف مهمة" });
const defaultItems = [i1, i2, i3];
const defaultChecked = [new Item({ name: "المهام المنجزة!" })];

const listSchema = {
  name: String,
  items: [itemSchema],
  checkedItems: [itemSchema],
};
const List = mongoose.model("List", listSchema);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

let port = process.env.PORT;
if(port = null || port =="") port=3000;
app.listen(port, (req, res) => {
  console.log("Server is running on server 3000");
});

app.get("/", (req,res)=> {
  List.find({}, (err, foundLists)=>{
    res.render("Home", {
      arDay: arabicDate,
      defaultList: defTitle,
      lists : foundLists
    })
  
  })
})

app.get("/main", (req, res) => {
  checkedItem.find(function (err, checkedResult) {
    Item.find(function (err, results) {
      if (results.length == 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) console.log(err);
          else console.log("Default items inserted successfully");
        });
        res.redirect("/main");
      } else {
        res.render("list", {
          arDay: arabicDate,
          listTitle: defTitle,
          listArray: results,
          historyList: checkedResult,
        });
      }
    });
  });
});

//custom list
app.get("/:listName", (req, res) => {
  let newListName = _.lowerCase(req.params.listName);

  List.findOne({ name: newListName }, (err, foundList) => {
    if (!err)
      if (!foundList) {
        const newList = new List({
          name: newListName,
          items: defaultItems,
          checkedItems: defaultChecked,
        });
        newList.save();
        res.redirect("/" + newListName);
      } else {
        res.render("list", {
          arDay: arabicDate,
          listTitle: foundList.name,
          listArray: foundList.items,
          historyList: foundList.checkedItems,
        });
      }
  });
});

app.post("/newList", (req,res)=>{
  const listName = req.body.newList;
  res.redirect("/"+listName);
})



app.post("/", (req, res) => {
  const listName = req.body.list;
  const newItem = new Item({ name: String(req.body.newItem) });

  if (listName == defTitle) {
    Item.insertMany([newItem], function (err) {
      if (err) console.log(err);
      else console.log("Successfully saved");
    });
    res.redirect("/main");
  } else {
    console.log("insert in :  " + listName);

    List.findOne({ name: listName }, function (err, foundList) {
      console.log(foundList);
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedList = req.body.title;
  const checkedItemName = req.body.itemName;
  const checkedItemID = req.body.itemID;
  const checked = new Item({ name: checkedItemName });
  console.log("checked item: " + checked);

  if (checkedList == defTitle) {
    checkedItem.insertMany([checked], function (err) {
      if (err) console.log(err);
      else console.log("inserted in checked items");
    });
    //const deleteItem= new Item({name: checkedItemName});
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if (err) console.log(err);
      else console.log("deleted successfully");
    });
    res.redirect("/main");
  } else {
    List.findOneAndUpdate(
      { name: checkedList },
      { $pull: { items: { _id: checkedItemID } } },
      (err, foundList) => {
        foundList.checkedItems.push(checked);
        foundList.save();

        res.redirect("/" + checkedList);
      }
    );
  }
});


app.post("/clear", (req, res) => {
  const clearedList = req.body.title;

  if (clearedList == defTitle) {
    checkedItem.deleteMany({}, function (err) {
      if (err) console.log(err);
      else console.log("all checked deleted successfully");
    });
    res.redirect("/main");
  } else {
    List.findOne({ name: clearedList }, (err, foundList) => {
      foundList.checkedItems = [];
      foundList.save();
      res.redirect("/" + clearedList);
    });
  }
});

app.post("/deleteList",(req,res)=>{
  const listTitle = req.body.title;
  console.log(listTitle);
  List.findOneAndRemove({name:listTitle},(err)=>{
    if(err) console.log(err);  else console.log(listTitle+ " deleted")
  })
  res.redirect("/");
})

function getArDay() {
  var today = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return today.toLocaleDateString("ar-FR-u-ca-islamic", options);
}
