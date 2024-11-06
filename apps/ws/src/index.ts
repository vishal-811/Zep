import WebSocket, { WebSocketServer} from "ws";
import http  from 'http';
import jwt from 'jsonwebtoken';
import prisma from '@repo/db/prisma'

const server = http.createServer((request,response)=>{
   response.end("Hi");
})

const wss = new WebSocketServer({ server });

interface position {
   x : number,
   y : number
}

interface dimension{
   width : number,
   height : number
}

const user = new Map<WebSocket, [string, position]>();
const space = new Map<string,dimension>();
const spaceSubscriber = new Map<string,WebSocket[]>()

function broadCastMsg(spaceId: string, ws: WebSocket, x: any, y: any) {
   const subscribers = spaceSubscriber.get(spaceId);
   if (subscribers) {
       subscribers.forEach((userWs) => {
           if (userWs !== ws) {
               userWs.send(JSON.stringify({ position: { x, y }, userId: ws }));
           }
       });
   }
}

function handleCloseEvent(){

}

async function handleWebsocketMessage(message : any, ws : WebSocket){
   const parsedData = JSON.parse(message.toString());
   console.log("The data is ", parsedData);
   const type = parsedData.type;
   
   switch(type){
      case "join":{
         const { spaceId, token } = parsedData.payload;
         // console.log("Token is ", token);
         // const isAuthorized = jwt.verify(token,process.env.JWT_SECRET || "ZEPSECRET")
         // if(!isAuthorized){
         //    ws.send("Not Auothorized");
         //    return;
         // }

         const isValidSpace = await prisma.space.findFirst({
            where:{
               id : spaceId
            }
         })

         if(!isValidSpace){
            ws.send("No space found with this Id");
            return;
         }

         const width = isValidSpace.width;
         const height = isValidSpace.height;
         // spawn the user to a random position
         user.set(ws, [
            spaceId,
            { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) }
        ]);
        const isSpaceAlreadyExist = space.get(spaceId);
        if(!isSpaceAlreadyExist){
         space.set(spaceId, {width : width , height : height});
         spaceSubscriber.set(spaceId,[ws])
        }
        else{
          const subscribers = spaceSubscriber.get(spaceId)
          subscribers?.push(ws);
          if(subscribers){
            spaceSubscriber.set(spaceId, subscribers);
          }
        }
        const userDetail = user.get(ws);
        let x;
        let y;
        if(userDetail){
          x = userDetail[1].x;
          y = userDetail[1].y;
        }
       
        ws.send(JSON.stringify({
          type :"user-joined",
          payload :{
            "x" : x,
            "y" :y,
            "userId" :ws,
          }
        }))

      //broadcast message to all the users in a same room
      broadCastMsg(spaceId,ws,x,y);
       break;
      }

      case "move" :{
         let { x, y } = parsedData.payload;
         console.log(x ,y);
         x=parseInt(x);
         y =parseInt(y);
         const spaceUserSubscribe = user.get(ws);
         let oldX;
         let oldY;
         if(spaceUserSubscribe){
            const [spaceId, position] = spaceUserSubscribe;
            const spaceDimension = space.get(spaceId)
            const width = spaceDimension?.width;
            const height = spaceDimension?.height;
            oldX = position.x;
            oldY = position.y;
            const diffX = Math.abs(oldX - x);
            const diffY = Math.abs(oldY - y);

            if( width && height){
               if((diffX >1 || diffY >1) || (oldX > width || oldY >height)){
                  ws.send(JSON.stringify({
                     type : "movement-rejected",
                     payload :{
                        x : oldX,
                        y : oldY
                     }
                  }))
               }
            }
            
            user.set(ws,[spaceId,{x :x , y :y}]);
            broadCastMsg(spaceId,ws,x,y)
            ws.send(JSON.stringify({
               type :"movement",
               payload :{
                  x : x,
                  y :y,
                  userId : ws
               }
            }))
         }
          
      } 
   }
}
wss.on('connection',(ws)=>{
  ws.on('error', console.error);
  ws.on('message',(message)=>{
     handleWebsocketMessage(message,ws);
  })

  ws.on('end',()=>{
     handleCloseEvent()
  })
})

server.listen(8080,()=>{
   console.log("Server is listening on port 8080");
})