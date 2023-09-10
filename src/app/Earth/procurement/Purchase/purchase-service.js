const Store = require("./purchase-store");
const ItemStore = require("../PurchaseItem/purchaseItem-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Purchase";
const userId = 1;
let currentCounter = 101;

class PurchaseService {
  constructor(store) {}

  // Add
  async Add(req, res, next) {
    try {
      const store = new Store(req.db);
      const itemStore = new ItemStore(req.db);
      const logs = new Logs(req.db);
      const data = req.body; // Pass the entire request body
      const prRef_code = generatePrCode(data.items);
      const itemsResult = await itemStore.add(data.items, prRef_code);
      const requestResult = await store.add({
        ...data,
        item_count: data.items.length,
        ref_code: prRef_code,
        pr_code: prRef_code,
        total_amount: itemsResult,
      });
      const response = {
        message: "Purchase Request added successfully",
        module: "Purchase Request",
        data: data,
      };
      res.status(201).json(response); // Send the response back to the client
    } catch (err) {
      next(err);
    }
  }

  async getAllData(req, res, next) {
    try {
      let result = [];
      const store = new Store(req.db);
      result = await store.getAll();

      if (!result) {
        result = [];
      }
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }


  //eto yung sa get all items
  async getAllItems(req, res, next) {
    try {
      const { prRef_code } = req.query; // Use prRef_code if it matches your route definition
  
      if (!prRef_code) {
        // Handle the case where prRef_code is missing in the request
        return res.status(400).json({ error: 'prRef_code is required' });
      }
  
      const itemStore = new ItemStore(req.db);
      // const store = new Store(req.db);
      // const request = await store.getAll();
      const items = await itemStore.getAll(prRef_code);
  
      if (items.length === 0) {
        // Handle the case where no items were found 
        return res.status(404).json({ error: 'No items found for prRef_code' });
      }
  
      // Send the items as a response
      return res.status(200).send({
        success: true,
        pr_code: prRef_code, 
        data: items,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get
  async get(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const result = await store.getByUUID(uuid);
      if (!result) {
        throw new NotFoundError("Data Not Found");
      }
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      //const userId = req.auth.id;
      const id = await store.getByUUID(uuid);
      if (!id) {
        throw new NotFoundError("ID Not Found");
      }
      const result = await store.update(uuid, body);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }
      // logs.add({
      //   uuid: userId,
      //   module: moduleName,
      //   action: `updated a row in ${moduleName} table`,
      //   data: result,
      //   ...body
      // });
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete
  async delete(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      //const userId = req.auth.id; // Get user ID using auth
      const result = await store.delete(uuid);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }
      logs.add({
        uuid: userId,
        module: moduleName,
        action: `deleted a row in ${moduleName} table`,
        data: result,
        ...body,
      });
      return res.status(202).send({
        success: true,
        message: "Purchase Deleted successfuly",
      });
    } catch (err) {
      next(err);
    }
  }
}

function generatePrCode(data) {
  const currentYear = new Date().getFullYear();
  const paddedCounter = currentCounter.toString().padStart(4, "0");

  currentCounter++;

  return `${data[0].product_id}${data[0].brand_id}${data[0].category_id}${
    data[0].supplier_id
  }${data[0].item_code
    .substring(0, 2)
    .toUpperCase()}${currentYear}${paddedCounter}`;
}

module.exports = PurchaseService;
