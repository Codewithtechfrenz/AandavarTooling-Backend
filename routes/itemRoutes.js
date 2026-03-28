const express = require('express');
const router = express.Router();

const itemController = require('../controllers/itemMasterController.js');

// ITEMS
router.post('/item', itemController.createItem);
router.get('/getItems', itemController.getItems);
router.get('/item/:SI', itemController.getItem);
router.post('/updateItem', itemController.updateItem);
router.post('/deleteItem', itemController.deleteItem);


// TOOLS
router.post('/createtool', itemController.createTool);
router.get('/getTools', itemController.getTools);
router.get('/tool/:SI', itemController.getTool);
router.post('/updateTool', itemController.updateTool);
router.post('/deleteTool', itemController.deleteTool);

//toolinward
router.post('/toolinwards', itemController.createToolInward);

//Tool stack
router.get('/getToolStock', itemController.getToolCurrentStock);


//currentstock
router.get('/getCurrentStocks', itemController.getCurrentStock);









// INWARD
router.post('/iteminward', itemController.createItemInward);



// FEED OUT
router.post('/linefeedout', itemController.createLineFeedOut);

// FEED IN
router.post('/linefeedins', itemController.createLineReturn);

// CATEGORY
router.post('/createCategory', itemController.createCategory);
router.get('/getCategories', itemController.getCategories);
router.get('/getCategory', itemController.getCategory);
router.post('/updateCategory', itemController.updateCategory);
router.post('/deleteCategory', itemController.deleteCategory);

// UOM
router.post('/createUOM', itemController.createUOM);
router.get('/getUOMs', itemController.getUOMs);
router.get('/getUOM', itemController.getUOM);
router.post('/updateUOM', itemController.updateUOM);
router.post('/deleteUOM', itemController.deleteUOM);

// WORKER
router.post('/createWorker', itemController.createWorker);
router.get('/getWorkers', itemController.getWorkers);
router.post('/getWorker', itemController.getWorker);          // use POST and pass WorkerID in body
router.post('/updateWorker', itemController.updateWorker);    // use POST and pass WorkerID in body
router.post('/deleteWorker', itemController.deleteWorker);

// CUSTOMER
router.post('/createCustomer', itemController.createCustomer);
router.get('/getCustomers', itemController.getCustomers);
router.post('/getCustomer', itemController.getCustomer);   // POST with body
router.post('/updateCustomer', itemController.updateCustomer); // POST with body
router.post('/deleteCustomer', itemController.deleteCustomer); // POST with body


//Customer dropdown

router.get('/getdropCustomers', itemController.getdropCustomer);






// SALES
router.post('/createSalesProduct', itemController.createSalesProduct);
router.get('/getSalesProducts', itemController.getSalesProducts);
router.post('/getSalesProduct', itemController.getSalesProduct);
router.post('/updateSalesProduct', itemController.updateSalesProduct);
router.post('/deleteSalesProduct', itemController.deleteSalesProduct);

//Machine master
router.post('/createMachine', itemController.createMachine);
router.get('/getMachines', itemController.getMachines);
router.post('/getMachine', itemController.getMachine);
router.post('/updateMachine', itemController.updateMachine);
router.post('/deleteMachine', itemController.deleteMachine);


//delivery challan
router.post('/createDeliveryChallan', itemController.createDeliveryChallan);
router.get('/getDeliveryChallans', itemController.getDeliveryChallans);
router.post('/getDeliveryChallan', itemController.getDeliveryChallan);
router.post('/updateDeliveryChallan', itemController.updateDeliveryChallan);
router.post('/deleteDeliveryChallan', itemController.deleteDeliveryChallan);



//return delivery challan
router.post("/createReturnDeliveryChallan", itemController.createReturnDeliveryChallan);
router.get("/getReturnDeliveryChallans", itemController.getReturnDeliveryChallans);
router.post("/getReturnDeliveryChallan", itemController.getReturnDeliveryChallan);
router.post("/deleteReturnDeliveryChallan", itemController.deleteReturnDeliveryChallan);















// ================= Dropdowns =================
// Get only active categories for dropdown
router.get('/activeCategorie', itemController.getActiveCategories);

// Get only active UOMs for dropdown
router.get('/activeUOM', itemController.getActiveUOMs);






// Get only active workers for dropdown

router.get('/activeworker', itemController.getActiveWorkers);



// Get only active machines for dropdown
router.get('/activemachine', itemController.getActiveMachines);



// Get only active items for dropdown
router.get('/activeitem', itemController.getActiveItems);



// Get only active tool for dropdown
router.get('/activetool', itemController.getActivetool);


// Get only active sales products for dropdown
router.get('/activesalesproducts', itemController.getActiveSalesProducts);



// Get only active sales products for dropdown
router.get('/dashboards', itemController.getDashboardData);





//
router.post('/create', itemController.createWorkOrder);
router.get('/list', itemController.getWorkOrders);
router.post('/complete', itemController.completeWorkOrder);













// Register
// router.post("/register", loginController.register);

// Login
// router.post("/login", loginController.login);












































module.exports = router;