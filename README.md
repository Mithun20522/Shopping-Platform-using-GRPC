# Shopping Plateform CLI based Application using GRPC in nodejs
This is a CLI based shopping application project that facilitates interactions between buyers and sellers through gRPC communication. It allows buyers and sellers to intract with each others functionalities and actions. <br/>
**It is part-1 of the Assignment-1 of my DSCD course**.

## Project Structure

- `buyers.js`: Contains functionality related to buyers.
- `market.js`: Manages the market functionality.
- `seller.js`: Contains functionality realted to sellers.
- `shopping.proto`: Defines the gRPC service and message types used for communication.
- `node_modules`: Directory containing Node.js modules.
- `package.json` and `package-lock.json`: Files defining project dependencies.

## Usage

1. **Installation**: Make sure you have Node.js installed on your system. Then, run `npm install` to install project dependencies.

2. **Running the Application**:
   - Start the market: `node market.js`
   - Start the sellers: `node sellers.js`
   - Start the buyers: `node buyers.js`
   

3. **Functionality**:
   - Market:
     - Work as a central plateform between sellers and buyers.
     - Assign unique item id to all the items added by sellers.
     - Send response as SUCCESS / FAILED for all the valid and invalid transactions or actions performed by both sellers and buyers.

   - Sellers:
     - Register using address(ip:port) and login using address(ip:port) and uuid(which will automatically assigned after registration).
     - SellItem.
     - UpdateItem.
     - DeleteItem.
     - DisplayItem.
     - Check for Notifications.

   - Buyers: 
     - Register using buyer address (ip:port) and login using buyer address (ip:port).
     - SearchItem.
     - BuyItem.
     - AddToWishList.
     - RateItem.
     - Check for Notifications.


## Dependencies

This project relies on the following dependencies:

- grpc: gRPC library for Node.js.
- Other dependencies listed in `package.json`.

