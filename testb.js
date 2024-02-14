const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const shoppingPackage = grpcObj.shoppingPackage;
const takeInput = require('prompt-sync')({sigint: true});
const buyers = new shoppingPackage.Shopping("localhost:8000", grpc.credentials.createInsecure());

console.log("\n");
console.log("***************Welcome to Buyers DashBoard**********************\n");
console.log("Please select one\n");
console.log("1. Search Item");
console.log("2. Buy Item");
console.log("3. Add to Wishlist");
console.log("4. Rate Item");
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
            list.some((obj) => {
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
            })
        }
    })
}
else if(ch === "2"){
    const itemID = takeInput("Enter itemID: ");
    const qty = takeInput("Enter Quantity: ");
    const sellerAddress = takeInput("Enter seller address(ip:port): ");

    buyers.BuyItem({
        "itemID":itemID,
        "qty":qty,
        "sellerAddress":sellerAddress,
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
else if(ch === "3"){
    const itemID = takeInput("Enter itemID: ");
    const sellerAddress = takeInput("Enter seller address(ip:port): ");

    buyers.AddToWishList({
        "itemID":itemID,
        "sellerAddress":sellerAddress,
        "status":"Null"
    }, (err, res) => {
        if(err){
            console.log("Error: ", err);
        }
        else{
            console.log(JSON.stringify(res));
        }
    })
}
else if(ch === "4"){
    const itemID = takeInput("Enter itemID: ");
    const sellerAddress = takeInput("Enter seller address(ip:port): ");
    const rate = parseInt(takeInput("Enter Your Rating (1-5): "));
    if(typeof(rate) !== "number" || (rate < 1 || rate > 5)){
        console.log("Invalid Rating, Please rate only from 1-5 !!");
    }
    else{
        buyers.RateItem({
            "itemID":itemID,
            "sellerAddress": sellerAddress,
            "rate":rate,
            "status":"Null"
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