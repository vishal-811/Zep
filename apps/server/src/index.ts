import express from "express"
import cors from "cors"
import rootRouter from './routes'

const app = express();
app.use(express.json());
app.use(cors());


app.get("/",(req,res)=>{
    res.status(200).json({msg:"Zep is under working"});
    return;
})

app.use('/api/v1',rootRouter);

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})