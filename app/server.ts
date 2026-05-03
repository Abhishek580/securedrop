import express from "express";

const app = express();
const PORT = 5001;
app.use(express.json()); 

app.get("/api/test", function(req, res){
    console.log('API created');
    res.status(200).json({message:'API created' })
    
});
app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`)
}) 
