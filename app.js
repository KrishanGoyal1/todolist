const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://admin-Krishan:kgkgkgkg@cluster0.6rauw1m.mongodb.net/todolistDB");
  console.log("Connected");

  const itemsSchema={
    name:String
  };

  const Item=mongoose.model("Item",itemsSchema);

  const item1=new Item({
    name: "Welcome to your To-Do list!"
  });

  const item2=new Item({
    name: "Hit the + icon to add a new item"
  });

  const item3=new Item({
    name: "<-- Hit this to delete an item"
  });

  const defaultItems=[item1, item2, item3];

  const listSchema={
    name:String,
    items: [itemsSchema]
  };

  const List=mongoose.model("List",listSchema);


  app.get("/", function(req, res) {

    // const day = date.getDate();
    Item.find({}).then(function(foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });
  });

  app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundList){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
    
        list.save(); 
        res.redirect("/"+customListName);
      } else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    })

   
  })

  app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName=req.body.list;
  
    const item=new Item({
      name: itemName
    });

    if(listName=== "Today"){
      item.save();

      res.redirect("/");
    } else{
      List.findOne({name:listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }
    

  
  });

  app.post("/delete",function(req,res){
    const checkedItemId= req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
      Item.findByIdAndRemove(checkedItemId).then(function(foundItems){
        Item.deleteOne({_id: checkedItemId})
      });
      res.redirect("/");
    } else{
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedItemId}}}).then(function(foundList){
        res.redirect("/"+listName);
      });
    }


  })

}






let port=process.env.port;
if(port==null || port==""){
  port=3000;
}



app.listen(port, function() {
  console.log("Server has started succesfully! on port "+ port);
});
