const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://prateek88786:newton13@cluster0.dwo5jsc.mongodb.net/chatDB')

const User = mongoose.model('user', {
  name: String,
  email: String,
  password: String,
  profilePic: String,
  selectedUser:String,
  unread:Array
});

const Message = mongoose.model('message', {
  senderUsername: String,
  receiverUsername: String,
  senderName: String,
  receiverName: String,
  content: String,
  timestamp: {type:Date,default:new Date()},
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/api/messages/:sender/:receiver', async (req, res) => {
  try {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
      $or: [
        { senderUsername: sender, receiverUsername: receiver },
        { senderUsername: receiver, receiverUsername: sender },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/send/',async(req,res)=>{
    console.log(req.body)
    await Message.insertMany(req.body)
    res.send(true)    
})
app.get('/api/login/',async(req,res)=>{
    console.log(req.query)
    const login=await User.find(req.query)
    res.send(login)
})
app.post('/api/signup',async(req,res)=>{
    await User.insertMany(req.body)
    res.send("SignUp successfull")
})
app.put('/api/selectUser/:email/:user',async (req,res)=>{
  await User.updateOne({email:req.params.email},{$set:{selectedUser:req.params.user}})
  const data=await User.find({email:req.params.email})
  let email=(req.params.user)
  let flag=0
  data[0].unread.map((c)=>{
    if(c.email===email){
      c.count=0
    }
  })
  await User.updateOne({email:req.params.email},{$set:{unread:data[0].unread}})
  res.json(data[0].unread)
})
app.put('/api/unread/:user/:email',async(req,res)=>{
  const data=await User.find({email:req.params.user})
  let email=(req.params.email)
  let flag=0
  console.log(data[0].unread)
  if(data[0].unread!==undefined){
  data[0].unread.map((c)=>{
    if(c.email===email){
      c.count+=1
      flag=1
    }
  })
  }
  if(flag==0){
    data[0].unread.push({email:email,count:1})
  }
  await User.updateOne({email:req.params.user},{$set:{unread:data[0].unread}})
  res.json(data[0].unread)
})
app.get('/api/user/:email',async(req,res)=>{
  const data=await User.find({email:req.params.email})
  res.json(data)
})
app.put('/api/unselect/:user',async(req,res)=>{
  await User.updateOne({email:req.params.user},{$set:{selectedUser:""}})
  res.send("done")

})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
