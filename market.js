const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("shopping.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const shoppingPackage = grpcObj.shoppingPackage;
var PORT = 0;
const market = new grpc.Server();

market.bindAsync("0.0.0.0:8000", grpc.ServerCredentials.createInsecure(),
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
    "RateItem":RateItem,
    "NotifyClient": NotifyClient,
    "buyerRegister":buyerRegister,
    "buyerLogin":buyerLogin
})

const registeredAddressesUUID = [];
function registerSellerHelper(sellerAddress, uuid) {
    const regInfo = {
        "sellerAddress":sellerAddress,
        "uuid":uuid
    }
    registeredAddressesUUID.push(regInfo);
}

const sellerInfo = [];
function RegisterSeller(call, callback){
    const isReg = registeredAddressesUUID.some((obj) => obj.sellerAddress === call.request.sellerAddress);
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
        console.log(`${currSeller.sellerAddress} is already registered.!`);
        callback(null, currSeller);
    }
      
}

let sellItemsinfo = [];
let sellerItemIDs = {};
function SellItem(call, callback){
    const isAccountExists = registeredAddressesUUID.some((obj) => obj.sellerAddress === call.request.sellerAddress && obj.uuid === call.request.uuid);
    if(isAccountExists){
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
            "rate":"-"
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
            "rate":"-"
        }
        callback(null, currItemInfo);
    }
    
    
}

let updatedNotification = [];
function UpdateItem(call, callback){
    const isAccountExists = registeredAddressesUUID.some((obj) => obj.sellerAddress === call.request.sellerAddress && obj.uuid === call.request.uuid);
    if(isAccountExists && (sellItemsinfo && sellItemsinfo.length > 0) && 
    (sellItemsinfo.some((obj) => obj.sellerAddress === call.request.sellerAddress && 
    obj.uniqueItemID === call.request.itemID))){
        sellItemsinfo.some(obj => {
            if (obj.uniqueItemID === call.request.itemID) {
                obj.pricePerunit = call.request.pricePerunit;
                obj.sellerAddress = call.request.sellerAddress;
                obj.qty = call.request.qty;

                const updatenotification = {
                    "itemID":obj.uniqueItemID,
                    "pricePerunit":obj.pricePerunit,
                    "productName":obj.ProductName,
                    "category":obj.category,
                    "description":obj.description,
                    "qty":obj.qty,
                    "rate":obj.rate,
                    "sellerAddress":obj.sellerAddress
                }

                updatedNotification.push(updatenotification);

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
    const isAccountExists = registeredAddressesUUID.some((obj) => obj.sellerAddress === call.request.sellerAddress && obj.uuid === call.request.uuid);
    if(isAccountExists && (sellItemsinfo && sellItemsinfo.length > 0) && 
        (sellItemsinfo.some((obj) => obj.sellerAddress === call.request.sellerAddress && 
        obj.uniqueItemID === call.request.itemID))){
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
    const isAccountExists = registeredAddressesUUID.some((obj) => obj.sellerAddress === call.request.sellerAddress && obj.uuid === call.request.uuid);
    if(isAccountExists){
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
    const isAccountExists = registeredAddressesUUID.some((obj) => obj.sellerAddress === call.request.sellerAddress && obj.uuid === call.request.uuid);
    if(isAccountExists){
        const loginInfo = {
            "sellerAddress":call.request.sellerAddress,
            "uuid": call.request.uuid,
            "status":"SUCCESS"
        }
        callback(null,loginInfo);
    }
    else{
        const loginInfo = {
            "sellerAddress":call.request.sellerAddress,
            "uuid": call.request.uuid,
            "status":"FAILED"
        }
        callback(null,loginInfo);
    }
}


function SearchItem(call, callback) {
    console.log(`Search request for Item name: ${call.request.itemName}, Category: ${call.request.itemCategory}`);

    let searchResults = [];

    if (call.request.itemName && call.request.itemCategory === "ANY") {
        searchResults = sellItemsinfo.filter(item => item.ProductName === call.request.itemName);
    }

    else if (call.request.itemName && call.request.itemCategory !== "ANY") {
        searchResults = sellItemsinfo.filter(item => item.ProductName === call.request.itemName && item.category === call.request.itemCategory);
    }

    else if (!call.request.itemName && call.request.itemCategory === "ANY") {
        searchResults = sellItemsinfo;
    }

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
let buyitemnotification = [];
function BuyItem(call, callback){
    const found = sellerItemIDs[call.request.sellerAddress].includes(call.request.itemID) &&
                sellItemsinfo.some((obj) => 
                    obj.sellerAddress === call.request.sellerAddress && 
                    obj.uniqueItemID === call.request.itemID &&
                    obj.qty >= call.request.qty
                );

    if(found){
        const BuyItemInfo = {
            "itemID": call.request.itemID,
            "qty": call.request.qty,
            "sellerAddress": call.request.sellerAddress,
            "status": "SUCCESS",
            "buyerAddress": call.request.buyerAddress
        }
        sellItemsinfo.some(obj => {
            if(obj.uniqueItemID === call.request.itemID && obj.sellerAddress === call.request.sellerAddress){
                obj.qty = obj.qty - call.request.qty
            }
        })
        buyitemnotification.push(BuyItemInfo);
        console.log(`Buy request  qty: ${call.request.qty} of item ${call.request.itemID}, from seller = ${call.request.sellerAddress} by buyer = ${call.request.buyerAddress}`);
        callback(null, BuyItemInfo);
    }
    else{
        const BuyItemInfo = {
            "itemID": call.request.itemID,
            "qty": call.request.qty,
            "sellerAddress": call.request.sellerAddress,
            "status": "FAILED",
            "buyerAddress": call.request.buyerAddress
        }
        callback(null, BuyItemInfo);
    }
}

let ratingNotification = [];
let buyerItemRatingIDInfo = {};
function RateItem(call, callback){

    if(!(buyerItemRatingIDInfo[call.request.buyerAddress] &&
        buyerItemRatingIDInfo[call.request.buyerAddress].itemID.valueOf() === call.request.itemID 
        && buyerItemRatingIDInfo[call.request.buyerAddress].sellerAddress.valueOf() === call.request.sellerAddress) 
        && sellerItemIDs[call.request.sellerAddress].includes(call.request.itemID)){
        const RateItemInfo = {
            "itemID":call.request.itemID,
            "sellerAddress": call.request.sellerAddress,
            "rate": call.request.rate,
            "status":"SUCCESS",
            "buyerAddress":call.request.buyerAddress
        }
        sellItemsinfo.some(obj => {
            if(obj.uniqueItemID === call.request.itemID && obj.sellerAddress === call.request.sellerAddress){
                obj.rate = call.request.rate;
            }
        });
        ratingNotification.push(RateItemInfo);
        const buyerRateInfo = {
            "itemID":RateItemInfo.itemID,
            "sellerAddress":RateItemInfo.sellerAddress
        }
        buyerItemRatingIDInfo[RateItemInfo.buyerAddress] = buyerRateInfo;
        console.log(`buyer = ${RateItemInfo.buyerAddress} rated item ${RateItemInfo.itemID} with ${RateItemInfo.rate} stars from seller = ${RateItemInfo.sellerAddress}`);
        callback(null, RateItemInfo);
    }
    else{
        const RateItemInfo = {
            "itemID":call.request.itemID,
            "sellerAddress": call.request.sellerAddress,
            "rate": call.request.rate,
            "status":"FAILED",
            "buyerAddress":call.request.buyerAddress
        }
        callback(null, RateItemInfo);
    }  
}


function AddToWishList(call, callback){
    if(sellerItemIDs[call.request.sellerAddress].includes(call.request.itemID)){
        const cartInfo = {
            "itemID":call.request.itemID,
            "sellerAddress":call.request.sellerAddress,
            "status":"SUCCESS",
            "buyerAddress":call.request.buyerAddress
        }
        console.log(`Wishlist request of item ${call.request.itemID}, from seller = ${call.request.sellerAddress} by buyer = ${call.request.buyerAddress}`);
        callback(null, cartInfo);
    }
    else{
        const cartInfo = {
            "itemID":call.request.itemID,
            "sellerAddress":call.request.sellerAddress,
            "status":"FAILED",
            "buyerAddress":call.request.buyerAddress
        }
        callback(null, cartInfo);
    }
    
}

function NotifyClient(call, callback){
    const info = {
        "upnotif":updatedNotification,
        "rateItemNotification":ratingNotification,
        "buyerAddress":call.request.buyerAddress,
        "buyitemnotification":buyitemnotification
    }
    callback(null, info);
}

const buyerAddressInfo = [];
function buyerRegister(call, callback) {
    if (!buyerAddressInfo.some(obj => obj.buyerAddress === call.request.buyerAddress)) {
        const buyerRegisterInfo = {
            "buyerAddress": call.request.buyerAddress,
            "status": "SUCCESS"
        }
        console.log(`buyer join request from ${buyerRegisterInfo.buyerAddress}`);
        buyerAddressInfo.push(buyerRegisterInfo);
        callback(null, buyerRegisterInfo);
    } else {
        const buyerRegisterInfo = {
            "buyerAddress": call.request.buyerAddress,
            "status": "FAILED"
        }
        callback(null, buyerRegisterInfo);
    }
}

function buyerLogin(call, callback) {
    const existingBuyer = buyerAddressInfo.find(obj => obj.buyerAddress === call.request.buyerAddress);
    if (existingBuyer) {
        const loginInfo = {
            "buyerAddress": call.request.buyerAddress,
            "status": "SUCCESS"
        }
        callback(null, loginInfo);
    } else {
        const loginInfo = {
            "buyerAddress": call.request.buyerAddress,
            "status": "FAILED"
        }
        callback(null, loginInfo);
    }
}

