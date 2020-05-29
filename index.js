const express=require('express');
const app=express();
const fetch=require('node-fetch');
const redis=require('redis');
const PORT=process.env.PORT || 5000;
const REDIS_PORT=process.env.PORT || 9000
app.listen(PORT,()=>{console.log("server running on port 5000")});
const client=redis.createClient({host:'redis',port:6379});
client.on('connect',()=>{console.log(` Connected with Settings ${process.env.REDIS_PORT_6379_TCP_ADDR} , + ${process.env.REDIS_PORT_6379_TCP_PORT}`)}).on('error',()=>{console.log('errros')})


function setRes(username,repos){
    return `<h2>${username} has ${repos} GitHub repos</h2>`
    }
app.get('/',(req,res)=>{
    res.json("Hello world")
})
app.get('/repos/:username',cache,getRepos);


//request for github data.
async function getRepos(req,res,next){
try{
console.log('Fetching Data')
const {username}=req.params;
const response=await fetch(`https://api.github.com/users/${username}`)
const data=await response.json();
const repos=data.public_repos;

//set data to redis..
client.setex(username,3600,repos);
res.send(setRes(username,repos))


}
catch(err)
{
    console.error(err);
    res.status(500);
    
}
}
//cashe middleware (actually use the cache)
function cache(req,res,next){
    const {username}= req.params;
    client.get(username,(err,data)=>{
        if(err) throw err;
        if(data){
            res.send(setRes(username,data));
        }
        else{
            next();
        }
    })
}