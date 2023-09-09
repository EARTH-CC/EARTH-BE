const Store = require("./purchaseOrder-store");
const ItemStore = require("./purchaseOrderitem-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Purchase Order";
const userId = 1;
let currentCounter = 101;

class PurchaseOrderService {
  constructor(store) {}

  // Add
  async Add(req, res, next) {          
    try {
      const store = new Store(req.db);
      const itemstore = new ItemStore(req.db);
      const logs = new Logs(req.db);
      const data = req.body;
      const poRef_code = generatePoCode(data.items);
      const itemsResult = await itemstore.add(data.items, poRef_code);
      const orderResult = await store.add({
        ...data,
        item_count: data.items.length,
        po_code: poRef_code,
        total_amount: itemsResult,
      });

      const response = {
        message: "Purchase Order added successfully",
        module: "Purchase Order",
        data: data,
      };
      res.status(201).json(response);
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

  // async getAll(req, res, next) {
  //   try {
  //     const store = new Store(req.db);
  //     const logs = new Logs(req.db);
  //     const uuid = req.params.uuid;
  //     const result = await store.getByUUID(uuid);
  //     if (!result) {
  //       throw new NotFoundError("Data Not Found");
  //     }
  //     return res.status(200).send({
  //       success: true,
  //       data: result,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

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

function generatePoCode(data) {
  const currentYear = new Date().getFullYear();
  const paddedCounter = currentCounter.toString().padStart(4, "0");

  currentCounter++;

  return `${data[0].category_id}${data[0].product_id}${data[0].brand_id}${
    data[0].supplier_id
  }${data[0].item_code
    .substring(0, 2)
    .toUpperCase()}${currentYear}${paddedCounter}`;
}

module.exports = PurchaseOrderService;
