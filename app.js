const express =require("express");
const bodyParser =require("body-parser");
const mongoose =require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');
const path = require("path");
const { log } = require("console");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
 
mongoose.connect("mongodb+srv://admin123:123admin@cluster0.zfxhnys.mongodb.net/todoListDB", {useNewUrlParser: true , useUnifiedTopology: true,});
const itemsSchema ={
    name:String
};
const Item =mongoose.model("Item",itemsSchema);
 const item1 =new Item({
    name:"todoitem1"
 });
 const item2 =new Item({
    name:"todoitem2"
 });
 const item3 =new Item({
    name:"todoitem3"
 });
 const item4 =new Item({
    name:"todoitem4"
 });
defaultitems=[item1,item2,item3,item4];
const listSchema ={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

let today=new Date();
let options={
    weekday:"long",
    day: "numeric",
    month: "long"
};
let todaydate = today.toLocaleDateString("en-US",options);
app.get('/',function(req,res){
   async function finduser(){
   const boxitem=await Item.find({});
   const litem=await List.find({});
   if(boxitem.length===0){
      Item.insertMany(defaultitems).then(function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("success");
        }
        res.redirect('/');
      });
   }
   else{
        res.render("list", {
          titles:litem,
           listtitle: todaydate,
            nitem: boxitem,
            url:req.protocol+"://"+req.headers.host
        });
    }
}
    finduser();

});

app.get('/:customnames',function(req,res){
const customnames=_.capitalize(req.params.customnames);


List.findOne({name:customnames}).then(function(foundList){
  if(!foundList){
    const list1=new List({
      name:customnames,
      items:defaultitems
    });
    list1.save();
    res.redirect('/' +customnames);
  }
  else{
    async function finduser(){
    const litem=await List.find({});
    res.render("list", {
      titles:litem,
      listtitle: foundList.name,
       nitem: foundList.items,
       url:req.protocol+"://"+req.headers.host
   });
  }
  finduser();
  }

});

});

 
app.post('/',function(req,res){
   const item =req.body.newitem;
    const listname=req.body.button;
    const nwitem=new Item({
      name:item
  });
  
   if(listname===todaydate){
    nwitem.save();
    res.redirect('/');
   }
   else{
    List.findOne({name:listname}).then(function(foundList){
   foundList.items.push(nwitem);
   foundList.save();
   res.redirect('/'+ listname);
    });
   }
    
    
 
});

app.post('/delete',function(req,res){
const itemid=req.body.checkbox;
const listname=req.body.listname;


const trimmedId = itemid.trim();

if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
  throw new Error('Invalid ID format');
}

  if(listname===todaydate ){
Item.findByIdAndDelete(trimmedId)
  .then(removedDocument => {
    if (removedDocument) {
      console.log('Document removed:', removedDocument);
    } else {
      console.log('No document found with that ID.');
    }
  })
  .catch(error => {
    console.error('Error removing document:', error);
  });

res.redirect('/');
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:trimmedId}}}).then(function(foundList) {
        res.redirect('/'+listname);
    });
  
  }



});
 
app.post('/titlelist',function(req,res){
const listtitle= req.body.title;
res.redirect("/"+listtitle);
});

app.post('/deletelist',function(req,res){
  const itemid=req.body.checkbox;
  const listname=req.body.listname;
  
  console.log(itemid)
  const trimmedId = itemid.trim();
  
  if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
    throw new Error('Invalid ID format');
  }
  List.findByIdAndDelete(trimmedId)
  .then(removedDocument => {
    if (removedDocument) {
      console.log('Document removed:', removedDocument);
    } else {
      console.log('No document found with that ID.');
    }
  })
  .catch(error => {
    console.error('Error removing document:', error);
  });

res.redirect('/');
});

const PORT=process.env.PORT || 3000;
app.listen(PORT,function(){
    console.log("server is running");
});