const express = require("express");
const bodyParser = require("body-parser");

const app = express();

let toDoItems = ["مذاكرة الرياضيات","تنظيف الغرفة"];
let historyList=[];
app.set('view engine', 'ejs');
//search in view folder

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.listen(3000, (req, res) => {
  console.log("Server is running on server 3000");
})

app.get("/", (req, res) => {
  let day = getArDay();
  res.render("list", {arDay  : day, listArray:toDoItems, historyList:historyList})
  //render > search in views folder about list.ejs file, then pass js  variable with a value
  //every time you render, we have to provide all variables in list.ejs
});

app.post("/",(req,res)=>{

  toDoItem = String(req.body.toDoItem);
  toDoItems.push(toDoItem);

  res.redirect("/")

})

app.post("/delete", function (req, res) {
  const listName = req.body.listName;

  historyList.push(toDoItems.pop(toDoItems.indexOf(listName)));
  console.log(historyList);
  res.redirect("/");
})

function  getArDay(){

  var today=new Date();
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString("ar-FR-u-ca-islamic", options);
}
