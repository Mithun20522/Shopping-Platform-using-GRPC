const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const shoppingPackage = grpcObj.shoppingPackage;
var PORT = 0;
const market = new grpc.Server();

market.bindAsync("localhost:8000", grpc.ServerCredentials.createInsecure(),
    (err , port) => {
        if(err){
            console.log("Error occured at market server port: ", err);
        }
        else{
            PORT = port;
        }
    });


market.addService(shoppingPackage.Shopping.service, {
    "RegisterSeller":RegisterSeller,
    "SellItem":SellItem,
    "UpdateItem":UpdateItem,
    "DeleteItem":DeleteItem,
    "DisplaySellerItems": DisplaySellerItems,
    "LoginByUUID":LoginByUUID,
    "SearchItem":SearchItem,
    "BuyItem":BuyItem,
    "AddToWishList":AddToWishList,
    "RateItem":RateItem
})

const registeredAddresses = [];
function checkIfSellerAddressIsRegistered(sellerAddress) {
    return registeredAddresses.includes(sellerAddress);
}

function registerSellerHelper(sellerAddress) {
    registeredAddresses.push(sellerAddress);
}

const sellerInfo = [];
function RegisterSeller(call, callback){
    const isReg = checkIfSellerAddressIsRegistered(call.request.sellerAddress);
    if(!isReg){
        const currSeller = {
            "uuid":call.request.uuid,
            "sellerAddress":call.request.sellerAddress,
            "status":"SUCCESS"
        }
        sellerInfo.push(currSeller);
        registerSellerHelper(call.request.sellerAddress, call.request.uuid);
        console.log(`Seller join request from ${currSeller.sellerAddress}, uuid = ${currSeller.uuid}`);
        callback(null, currSeller);  
    }
    else{
        const currSeller = {
            "uuid":call.request.uuid,
            "sellerAddress":call.request.sellerAddress,
            "status":"FAILED"
        }
        console.log(`Seller join request from ${currSeller.sellerAddress} is already registered.!`);
        callback(null, currSeller);
    }
      
}

let sellItemsinfo = [];
let sellerItemIDs = {};
function SellItem(call, callback){
    if(registeredAddresses.includes(call.request.sellerAddress)){
        if (!sellerItemIDs[call.request.sellerAddress]) {
            sellerItemIDs[call.request.sellerAddress] = [];
        }
        
        const currItemInfo = {
            "ProductName": call.request.ProductName,
            "category":call.request.category,
            "qty":call.request.qty,
            "description":call.request.description,
            "sellerAddress":call.request.sellerAddress,
            "uuid":call.request.uuid,
            "pricePerunit":call.request.pricePerunit,
            "uniqueItemID": sellerItemIDs[call.request.sellerAddress].length + 1,
            "status":"SUCCESS",
            "rate":0
        }
        sellItemsinfo.push(currItemInfo);
        sellerItemIDs[call.request.sellerAddress].push(currItemInfo.uniqueItemID);
        console.log(`Sell Item request from ${call.request.sellerAddress}`);
        callback(null, currItemInfo);
    }
    else{
        const currItemInfo = {
            "ProductName": call.request.ProductName,
            "category":call.request.category,
            "qty":call.request.qty,
            "description":call.request.description,
            "sellerAddress":call.request.sellerAddress,
            "uuid":call.request.uuid,
            "pricePerunit":call.request.pricePerunit,
            "uniqueItemID": -1,
            "status":"FAILED",
            "rate":0
        }
        callback(null, currItemInfo);
    }
    
    
}

function UpdateItem(call, callback){

    if(registeredAddresses.includes(call.request.sellerAddress)){
        sellItemsinfo.forEach(obj => {
            if (obj.uniqueItemID === call.request.itemID) {
                obj.pricePerunit = call.request.pricePerunit;
                obj.sellerAddress = call.request.sellerAddress;
                obj.qty = call.request.qty;
            }
        });
        const UpdateItemInfo = {
            "itemID": call.request.itemID,
            "qty": call.request.qty,
            "sellerAddress": call.request.sellerAddress,
            "uuid": call.request.uuid,
            "pricePerunit": call.request.pricePerunit,
            "status": "SUCCESS"
        }
        console.log(`Update Item ${call.request.itemID} request from ${call.request.sellerAddress}`);
        // console.log(sellItemsinfo);
        callback(null,UpdateItemInfo);
    }
    else{
        const UpdateItemInfo = {
            "itemID": call.request.itemID,
            "qty": call.request.qty,
            "sellerAddress": call.request.sellerAddress,
            "uuid": call.request.uuid,
            "pricePerunit": call.request.pricePerunit,
            "status": "FAILED"
        }
        callback(null,UpdateItemInfo);
    }

    
}


function DeleteItem(call, callback){
    if(registeredAddresses.includes(call.request.sellerAddress)){
        const afterDeletionSellIteminfo = sellItemsinfo.filter((obj) => {
            return !(obj.uniqueItemID === call.request.itemID && 
                     obj.sellerAddress === call.request.sellerAddress && 
                     obj.uuid === call.request.uuid);
        });
        sellItemsinfo = afterDeletionSellIteminfo;
        const DeleteItemInfo = {
            "itemID":call.request.itemID,
            "sellerAddress":call.request.sellerAddress,
            "uuid":call.request.uuid,
            "status":"SUCCESS"
        }
        sellerItemIDs[DeleteItemInfo.sellerAddress] = sellerItemIDs[DeleteItemInfo.sellerAddress].filter(id => id !== DeleteItemInfo.itemID);
        console.log(`Delete Item ${call.request.itemID} request from ${call.request.sellerAddress}`);
        // console.log(sellItemsinfo);
        callback(null,DeleteItemInfo);
    }
    else{
        const DeleteItemInfo = {
            "itemID":call.request.itemID,
            "sellerAddress":call.request.sellerAddress,
            "uuid":call.request.uuid,
            "status":"FAILED"
        }
        callback(null, DeleteItemInfo);

    }
    
}


function DisplaySellerItems(call, callback) {
    if(registeredAddresses.includes(call.request.sellerAddress)){
        const DisplaySellerItemsInfo = {
            "uuid":call.request.uuid,
            "sellerAddress":call.request.sellerAddress,
            "items": sellItemsinfo,
            "status":"SUCCESS"
        }
        console.log(`Display Items request from ${call.request.sellerAddress}`);
        callback(null, DisplaySellerItemsInfo);
    }
    else{
        const DisplaySellerItemsInfo = {
            "uuid":call.request.uuid,
            "sellerAddress":call.request.sellerAddress,
            "items": sellItemsinfo,
            "status":"FAILED"
        }
        callback(null, DisplaySellerItemsInfo);
    }
    
}


function LoginByUUID(call, callback){
    const uuid = call.request.uuid;
    if(sellerInfo.find(id => id.uuid === uuid)){
        const loginInfo = {
            "uuid": uuid,
            "status":"SUCCESS"
        }
        callback(null,loginInfo);
    }
    else{
        const loginInfo = {
            "uuid": uuid,
            "status":"FAILED"
        }
        callback(null,loginInfo);
    }
}


function SearchItem(call, callback) {
    console.log(`Search request for Item name: ${call.request.itemName}, Category: ${call.request.itemCategory}`);

    let searchResults = [];

    // If itemName is provided and itemCategory is "ANY"
    if (call.request.itemName && call.request.itemCategory === "ANY") {
        searchResults = sellItemsinfo.filter(item => item.ProductName === call.request.itemName);
    }
    // If itemName is provided and itemCategory is not "ANY"
    else if (call.request.itemName && call.request.itemCategory !== "ANY") {
        searchResults = sellItemsinfo.filter(item => item.ProductName === call.request.itemName && item.category === call.request.itemCategory);
    }
    // If itemName is not provided and itemCategory is "ANY"
    else if (!call.request.itemName && call.request.itemCategory === "ANY") {
        searchResults = sellItemsinfo;
    }
    // If itemName is not provided and itemCategory is not "ANY"
    else if (!call.request.itemName && call.request.itemCategory !== "ANY") {
        searchResults = sellItemsinfo.filter(item => item.category === call.request.itemCategory);
    }

    const fetchedItemsInfo = {
        "itemName": call.request.itemName,
        "itemCategory": call.request.itemCategory,
        "items": searchResults
    };

    callback(null, fetchedItemsInfo);
}


function BuyItem(call, callback){
    const found = sellerItemIDs[call.request.sellerAddress].includes(call.request.itemID) &&
                sellItemsinfo.some(obj => obj.qty >= call.request.qty);

    if(found){
        const BuyItemInfo = {
            "itemID": call.request.itemID,
            "qty": call.request.qty,
            "sellerAddress": call.request.sellerAddress,
            "status": "SUCCESS"
        }
        sellItemsinfo.some(obj => {
            if(obj.uniqueItemID === call.request.itemID && obj.sellerAddress === call.request.sellerAddress){
                obj.qty = obj.qty - call.request.qty
            }
        })
        console.log(`Buy request  qty: ${call.request.qty} of item ${call.request.itemID}, from ${call.request.sellerAddress}`);
        callback(null, BuyItemInfo);
    }
    else{
        const BuyItemInfo = {
            "itemID": call.request.itemID,
            "qty": call.request.qty,
            "sellerAddress": call.request.sellerAddress,
            "status": "FAILED"
        }
        callback(null, BuyItemInfo);
    }
}


function RateItem(call, callback){
    if(sellerItemIDs[call.request.sellerAddress].includes(call.request.itemID)){
        const RateItemInfo = {
            "itemID":call.request.itemID,
            "sellerAddress": call.request.sellerAddress,
            "rate": call.request.rate,
            "status":"SUCCESS"
        }

        sellItemsinfo.some(obj => {
            if(obj.uniqueItemID === call.request.itemID && obj.sellerAddress === call.request.sellerAddress){
                obj.rate = call.request.rate;
            }
        });
        console.log(sellItemsinfo);
        console.log(`${RateItemInfo.sellerAddress} rated item ${RateItemInfo.itemID} with ${RateItemInfo.rate} stars.`);
        callback(null, RateItemInfo);
    }
    else{
        const RateItemInfo = {
            "itemID":call.request.itemID,
            "sellerAddress": call.request.sellerAddress,
            "rate": call.request.rate,
            "status":"FAILED"
        }
        callback(null, RateItemInfo);
    }  
}


function AddToWishList(call, callback){
    console.log(`Wishlist request of item ${call.request.itemID}, from ${call.request.sellerAddress}`)
}
