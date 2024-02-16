const { v4: uuidv4 } = require('uuid');
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const shoppingPackage = grpcObj.shoppingPackage;
const takeInput = require('prompt-sync')({sigint: true});
const seller = new shoppingPackage.Shopping("localhost:8000", grpc.credentials.createInsecure());


console.log("\n");
console.log("*************** Welcome to Seller's DashBoard **********************\n");
console.log("Please select one\n");
console.log("1. New Seller");
console.log("2. Have an account ? ");
const ch = takeInput("Your choice: ");
if(ch === "1"){
    try {
        const sellerAddress = takeInput("Enter Your seller address(ip:port): ");
        const uuidID = uuidv4();
        
        const funcstatus = new Promise((resolve, reject) => {
            seller.RegisterSeller({ "uuid": uuidID,"sellerAddress": sellerAddress,"status":"NULL"}, (err, res) => {
                if (err) {
                    console.log("Error: ", err);
                    reject(err);
                } else {
                    if(res.status === "SUCCESS"){
                        console.log(`${res.status} and UUID: ${uuidID} generated`)
                    }
                    else{
                        console.log(res.status);
                    }
                    resolve(res);
                }
            });
        });
    } catch (error) {
        console.log("Error:", error);
    }

}
else if(ch === "2"){
    var loginStatus = "null";
    const sellerAddress = takeInput("Enter your seller Address (ip:port) : ");
    const uuid = takeInput("Enter your UUID to proceed: ");
    try {
        const funcstatus = new Promise((resolve, reject) => {
            seller.LoginByUUID({
                "sellerAddress":sellerAddress,
                "uuid":uuid,
                "status":"Null"
            },(err, res) => {
                if(err){
                    console.log("Error: ", err);
                    reject(err);
                }
                else{
                    loginStatus = res.status;
                    console.log(res.status);
                    if(loginStatus === "SUCCESS"){
                        console.log("What do you want to do?\n");
                        console.log("1. Sell Item");
                        console.log("2. Update Item");
                        console.log("3. Delete Item");
                        console.log("4. Display Items");
                        console.log("5. Check Notification");
                        const act = takeInput("Your choice: ");
                        if(act === "1"){
                            const ProductName = takeInput("Product Name: ");
                            const category = takeInput("Category (ELECTRONICS, FASHION, or OTHERS): ");
                            const qty = takeInput("Quantity: ");
                            const description = takeInput("Description: ");
                            // const sellerAddress = takeInput("Seller Address: ");
                            const pricePerunit = takeInput("Price Per Unit: ");
                            seller.sellItem({
                                "ProductName":ProductName,
                                "category":category,
                                "qty":parseInt(qty),
                                "description":description,
                                "sellerAddress":sellerAddress,
                                "uuid":uuid,
                                "pricePerunit":parseInt(pricePerunit),
                                "status": "Null"
                            },(err, res) => {
                                if(err){
                                    console.log("Error: ", err);
                                }
                                else{
                                    console.log(JSON.stringify(res.status));
                                }
                            });
                        }
                        else if(act === "2"){
                            const itemID = takeInput("Enter itemID to update: ");
                            const newpricePerunit = takeInput("Price Per Unit: ");
                            const newqty = takeInput("Quantity: ");
                            // const sellerAddress = takeInput("Enter your Seller address(ip:port): ");
                            // const uuid = takeInput("Enter your UUUID: ")
                            seller.UpdateItem({
                                "itemID": parseInt(itemID),
                                "qty":parseInt(newqty),
                                "sellerAddress":sellerAddress,
                                "uuid":uuid,
                                "pricePerunit":parseInt(newpricePerunit),
                                "status":"Null"
                            }, (err, res) => {
                                if(err){
                                    console.log("Error: ", err);
                                }
                                else{
                                    console.log(JSON.stringify(res.status));
                                }
                            });

                            }
                        else if(act === "3"){
                            const deleteItemID = takeInput("Enter itemID to delete Item: ");
                            // const sellerAddress = takeInput("Enter seller address(ip:port): ");
                            // const uuid = takeInput("Enter your UUID: ");
                            seller.DeleteItem({
                                "itemID":deleteItemID,
                                "sellerAddress":sellerAddress,
                                "uuid":uuid,
                                "status":"Null"
                            },(err, res) => {
                                if(err){
                                    console.log("Error: ", err);
                                }
                                else{
                                    console.log(JSON.stringify(res.status));
                                }
                            });
                        }
                        else if(act === "4"){
                            // const sellerAddress = takeInput("Enter seller address(ip:port): ");
                            // const uuid = takeInput("Enter your UUID: ");
                            seller.DisplaySellerItems({
                                "uuid": uuid,
                                "sellerAddress":sellerAddress,
                                "items":[],
                                "status":"Null"
                            }, (err, res) => {
                                if(err){
                                    console.log("Error: ", err);
                                }
                                else{
                                    const DisplaySellerItemsInfo = res.items;
                                    if(DisplaySellerItemsInfo && DisplaySellerItemsInfo.length > 0){
                                        DisplaySellerItemsInfo.some((obj) => {
                                            if(obj.sellerAddress === sellerAddress && obj.uuid === uuid){
                                                console.log("--");
                                                console.log(`Item ID: ${obj.uniqueItemID}, Price: ${obj.pricePerunit}, Name: ${obj.ProductName}, Category: ${obj.category},`);
                                                console.log(`Description: ${obj.description}`);
                                                console.log(`Quantity Remaining: ${obj.qty}`);
                                                console.log(`Rating: ${obj.rate}/5  |  Seller: ${obj.sellerAddress}`);
                                                console.log("--");
                                            }
                                        })
                                    }
                                    else{
                                        console.log("Nothing to display!!!");
                                    }
                                    
                                }
                            })
                        }
                        else if(act === "5"){
                            console.log("All your notifications appeared here:");
                            seller.NotifyClient({
                                "updateListNotification":[],
                                "rateItemNotification":[],
                                "status":"Null",
                                "buyitemnotification":[]
                            }, (err, res) =>{
                                if(err){
                                    console.log("Error: ", err);
                                }
                                else{
                                    const ratingNotification = res.rateItemNotification;
                                    const buyitemnotification = res.buyitemnotification;
                                    if(ratingNotification && ratingNotification.length > 0){
                                        ratingNotification.some(obj => {
                                            if(obj.sellerAddress === sellerAddress){
                                                console.log(`${obj.buyerAddress} rated item ${obj.itemID} with ${obj.rate} star.`);
                                            }
                                            
                                        })
                                    }
                                    if(buyitemnotification && buyitemnotification.length > 0){
                                        buyitemnotification.some(obj => {
                                            if(obj.sellerAddress === sellerAddress){
                                                console.log(`Buy request  qty: ${obj.qty} of item ${obj.itemID}, from seller = ${obj.sellerAddress} by buyer = ${obj.buyerAddress}`);
                                            }
                                            
                                        })
                                    }
                                    else{
                                        console.log("Nothing to show...!!!");
                                    }
                                }
                            })                            
                        }
                    }
                }
            })
        })
        
    } catch (error) {
        console.log("Error: ", error);
    }    
}



