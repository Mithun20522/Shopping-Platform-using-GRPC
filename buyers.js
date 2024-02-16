const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const shoppingPackage = grpcObj.shoppingPackage;
const takeInput = require('prompt-sync')({sigint: true});
const buyers = new shoppingPackage.Shopping("localhost:8000", grpc.credentials.createInsecure());

console.log("\n");
console.log("*************** Welcome to Buyers DashBoard **********************\n");
console.log("Please select one\n");
console.log("1. New Buyer");
console.log("2. Have an account ? ");
const act = takeInput("Your choice: ");
if(act === "1"){
    const buyerAddress = takeInput("Enter your buyer address (ip:port) : ");
    buyers.buyerRegister({
        "buyerAddress":buyerAddress,
        "status":"Null"
    }, (err, res) => {
        if(err){
            console.log("Error: ", err);
        }
        else{
            console.log(JSON.stringify(res.status));
        }
    })
}
else if(act === "2"){
    const buyerAddress = takeInput("Enter your buyer address (ip:port) : ");
    buyers.buyerLogin({
        "buyerAddress":buyerAddress,
        "status":"Null"
    }, (err, res) => {
        if(err){
            console.log("Error: ", err);
        }
        else{
            if(res.status === "SUCCESS"){
                console.log("Please select one\n");
                console.log("1. Search Item");
                console.log("2. Buy Item");
                console.log("3. Add to Wishlist");
                console.log("4. Rate Item");
                console.log("5. Check Notification");
                const ch = takeInput("Your choice: ");
                
                if(ch === "1"){
                    const itemName = takeInput("Enter Item Name: ");
                    const itemCategory = takeInput("Enter Item Category: ");
                    buyers.SearchItem({
                        "itemName":itemName,
                        "itemCategory":itemCategory
                    },(err, res) => {
                        if(err){
                            console.log("Error: ", err);
                        }
                        else{
                            const list = res.items;
                            if(list && list.length > 0){
                                list.some((obj) => {
                                    console.log("--");
                                    console.log(`Item ID: ${obj.uniqueItemID}, Price: ${obj.pricePerunit}, Name: ${obj.ProductName}, Category: ${obj.category},`);
                                    console.log(`Description: ${obj.description}`);
                                    console.log(`Quantity Remaining: ${obj.qty}`);
                                    console.log(`Rating: ${obj.rate}/5  |  Seller: ${obj.sellerAddress}`);
                                    console.log("--");
                                })
                            }
                            else{
                                console.log("Nothing to show...!!!!");
                            }
                            
                        }
                    })
                }
                else if(ch === "2"){
                    const itemID = takeInput("Enter itemID: ");
                    const qty = takeInput("Enter Quantity: ");
                    const sellerAddress = takeInput("Enter seller address(ip:port) from which you are going to purchase: ");
                    // const buyerAddress = takeInput("Enter Your buyer address(ip:port): ");
                
                    buyers.BuyItem({
                        "itemID":itemID,
                        "qty":qty,
                        "sellerAddress":sellerAddress,
                        "status":"Null",
                        "buyerAddress":buyerAddress
                    }, (err, res) => {
                        if(err){
                            console.log("Error: ", err);
                        }
                        else{
                            console.log(JSON.stringify(res.status));
                        }
                    })
                
                }
                else if(ch === "3"){
                    const itemID = takeInput("Enter itemID: ");
                    const sellerAddress = takeInput("Enter seller address(ip:port): ");
                    // const buyerAddress = takeInput("Enter Your buyer address(ip:port): ");
                    buyers.AddToWishList({
                        "itemID":itemID,
                        "sellerAddress":sellerAddress,
                        "status":"Null",
                        "buyerAddress":buyerAddress
                    }, (err, res) => {
                        if(err){
                            console.log("Error: ", err);
                        }
                        else{
                            console.log(JSON.stringify(res.status));
                        }
                    })
                }
                else if(ch === "4"){
                    const itemID = takeInput("Enter itemID: ");
                    const sellerAddress = takeInput("Enter seller address(ip:port): ");
                    // const buyerAddress = takeInput("Enter Your buyer address(ip:port): ");
                    const rate = parseInt(takeInput("Enter Your Rating (1-5): "));
                    if((rate < 1 || rate > 5)){
                        console.log("Invalid Rating, Please rate only from 1-5 !!");
                    }
                    else{
                        buyers.RateItem({
                            "itemID":itemID,
                            "sellerAddress": sellerAddress,
                            "rate":rate,
                            "status":"Null",
                            "buyerAddress": buyerAddress
                        },(err, res) => {
                            if(err){
                                console.log("Error: ", err);
                            }
                            else{
                                console.log(JSON.stringify(res.status));
                            }
                        })
                
                    }
                    
                }
                else if(ch === "5"){
                    // const buyerAddress = takeInput("Enter your buyer address(ip:port) : ");
                    console.log("All your notifications appeared here: ");
                    buyers.NotifyClient({
                        "upnotif":[],
                        "rateItemNotification":[],
                        "buyerAddress":buyerAddress,
                        "buyitemnotification":[]
                    }, (err, res) =>{
                        if(err){
                            console.log("Error: ", err);
                        }
                        else{
                            const updateListNotification = res.upnotif;
                            if(updateListNotification && updateListNotification.length > 0){
                                updateListNotification.some(obj => {
                                    console.log("#######");
                                    console.log("The Following Item has been updated:");
                                    console.log(`Item ID: ${obj.itemID}, Price: ${obj.pricePerunit}, Name: ${obj.productName}, Category: ${obj.category},`);
                                    console.log(`Description: ${obj.description}`);
                                    console.log(`Quantity Remaining: ${obj.qty}`);
                                    console.log(`Rating: ${obj.rate}/5  |  Seller: ${obj.sellerAddress}`);
                                    console.log("#######");
                                })
                            }
                            else{
                                console.log("Nothing to show....!!!!");
                            }
                
                        }
                    });
                }
                        }
                        else{
                            console.log(JSON.stringify(res.status));
                        }
                    }
                })
    
}


