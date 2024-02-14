const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObj.shoppingPackage;


const server = new grpc.Server();

server.bindAsync("localhost:40000", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if(err){
        console.log("error: ", err);
    }
    else{
        console.log("listening on port", port);
    }
})

server.addService(todoPackage.Todo.service, {
    "createTodo": createTodo,
    "readTodos": readTodos
});

const todos = []
function createTodo(call, callback) {
    const todoItem = {
        "id": todos.length + 1,
        "text": call.request.text
    }
    todos.push(todoItem);
    callback(null, todoItem);
}

function readTodos(call, callback) {
    callback(null, {"items": todos});
}