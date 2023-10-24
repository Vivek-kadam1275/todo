const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ =require('loadsh');

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));



               // node.js is connected to a local databse
// mongoose.connect('mongodb://127.0.0.1:27017/ToDodb', { useNewUrlParser: true, useUnifiedTopology: true })
    // .then(() => console.log('DB Connected'));

              // node.js is connected to a atlas database.
mongoose.connect('mongodb+srv://vivek1275:<password>@cluster0.hvkazly.mongodb.net/ToDodb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB Connected'));

// schema is declared.
const itemSchema = mongoose.Schema({
    name: String
})
// model is declared with collection name
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: 'wake up'
})
const item2 = new Item({
    name: 'take bath'
})
const item3 = new Item({
    name: 'be ready '
})

const insertValues = [item1, item2, item3];








app.get('/', (req, res) => {
    // fetching the inserted values.
    Item.find()
        .then((foundlist) => {
            // console.log(foundlist);

            if (foundlist.length === 0) {
                             // inserted default values.
                Item.insertMany(insertValues)
                    .then(() => { console.log('inserted successfully') })
                    .catch((err) => { console.log(err) });
                    res.redirect('/');
            }

            else{
                res.render('main.ejs', { itemlist: foundlist ,listTitle: 'Today'});
                // console.log('item list already added');
            }
        })
        .catch((err) => { console.log(err) });

})

app.post('/add',(req,res)=>{
    const item=req.body.newItem;
    const listName=req.body.list;
    
    const newItem=new Item({
        name: item
    })
    
     if(listName==='Today')
    {
        newItem.save();
        res.redirect('/');

    }
    else{
        CustomList.findOne({name:listName})
        .then((foundlist)=>{
          foundlist.items.push(newItem);
          foundlist.save();
          res.redirect('/'+listName);
           
        })
        .catch((err)=>{
            console.log(err);
        })
    }
})


app.post('/delete',(req,res)=>{
    // console.log(req.body.id);
    const listName=req.body.list;
    if(listName=== 'Today')
    {
        Item.deleteOne({_id: req.body.id})
        .then(()=>{console.log('succesfully deleted')})
        .catch((err)=>{console.log(err)});
    
        res.redirect('/');
    
    }
    else{
        CustomList.findOneAndUpdate({name:listName},{$pull:{items:{_id:req.body.id}}}).then(()=>{console.log('deleted')});
        res.redirect('/'+listName);
    }
   
})

const listScehma=mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const CustomList=mongoose.model('CustomList',listScehma);


app.get('/:customListName',(req,res)=>{
    const customListName= _.capitalize(req.params.customListName);
    console.log(customListName);
   

   CustomList.findOne({name: customListName}).then((listvalue)=>{
         if(listvalue)
         {
            console.log('alreaddy exists ');
            console.log(listvalue);
            res.render('main.ejs',{listTitle: customListName, itemlist: listvalue.items})
             
            
         }
         else{
            const list=new CustomList({
                name: customListName,
                items: insertValues
            })
            list.save();
            res.redirect('/' + customListName);
         }
   })
   .catch((err)=>{console.log(err)}); 

 
    
    
})






app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})