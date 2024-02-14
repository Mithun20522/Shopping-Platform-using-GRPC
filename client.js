const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObj.shoppingPackage;

const client = new todoPackage.Todo("localhost:40000", grpc.credentials.createInsecure());

client.createTodo({
    "id": -1,
    "text": "do sleep"
}, (err, res) => {
    if(err){
        console.log("Error: ", err);
    }
    else{
        console.log("recieved from server: "+ JSON.stringify(res));
    }
    
})

client.readTodos(null, (err , res) => {
    if(err){
        console.log("Error: ", err);
    }
    else{
        console.log("read from server: "+ JSON.stringify(res));
    }
    
})
