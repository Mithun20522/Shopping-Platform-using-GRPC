const { v4: uuidv4 } = require('uuid');
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const shoppingPackage = grpcObj.shoppingPackage;
const takeInput = require('prompt-sync')({sigint: true});
const seller = new shoppingPackage.Shopping("localhost:8000", grpc.credentials.createInsecure());


console.log("\n");
console.log("***************Welcome to Seller's DashBoard**********************\n");
console.log("Please select one\n");
console.log("1. New User");
console.log("2. Have an account ? ");
const ch = takeInput("Your choice: ");
console.log("\n");
if(ch === "1"){
    try {
        const sellerAddress = takeInput("Enter address(ip:port): ");
        console.log("\n");
        const uuidID = uuidv4();
        const funcstatus = new Promise((resolve, reject) => {
            seller.RegisterSeller({ "uuid": uuidID,"sellerAddress": sellerAddress,"status":"NULL"}, (err, res) => {
                if (err) {
                    console.log("Error: ", err);
                    reject(err);
                } else {
                    console.log(JSON.stringify(res.status));
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
    const uuid = takeInput("Enter your UUID to proceed: ");
    console.log("\n");
    try {
        const funcstatus = new Promise((resolve, reject) => {
            seller.LoginByUUID({
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
                        console.log("\n");
                        console.log("What do you want to do?\n");
                        console.log("1. Sell Item");
                        console.log("2. Update Item");
                        console.log("3. Delete Item");
                        console.log("4. Display Items");
                        const act = takeInput("Your choice: ");
                        if(act === "1"){
                            const ProductName = takeInput("Product Name: ");
                            const category = takeInput("Category (ELECTRONICS, FASHION, or OTHERS): ");
                            const qty = takeInput("Quantity: ");
                            const description = takeInput("Description: ");
                            const sellerAddress = takeInput("Seller Address: ");
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
                            const sellerAddress = takeInput("Enter your Seller address(ip:port): ");
                            const uuid = takeInput("Enter your UUUID: ")
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
                            const sellerAddress = takeInput("Enter seller address(ip:port): ");
                            const uuid = takeInput("Enter your UUID: ");
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
                            const sellerAddress = takeInput("Enter seller address(ip:port): ");
                            const uuid = takeInput("Enter your UUID: ");
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
                                    // console.log(JSON.stringify(res));
                                    const DisplaySellerItemsInfo = res.items;
                                    DisplaySellerItemsInfo.some((obj) => {
                                        if(obj.sellerAddress === sellerAddress && obj.uuid === uuid){
                                            const showItemsInfo = {
                                                "Item_ID": obj.uniqueItemID,
                                                "Price": obj.pricePerunit,
                                                "Name": obj.ProductName,
                                                "Category": obj.category,
                                                "Description": obj.description,
                                                "Quantity_Remaining": obj.qty,
                                                "Seller": obj.sellerAddress,
                                                "Rating": `${obj.rate}/5`
                                            }
                                            console.log(showItemsInfo);
                                        }
                                    })
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





