const Store = require("./cart-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Cart";
const userId = 1;

class CartService {
  constructor(store) {}

  // Add
  async add(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const data = req.body;

      const newCanvass = await store.add(data);

      res
        .status(201)
        .json({
          message: "Canvass added successfully",
          uuid: userId,
          module: moduleName,
          data: data,
        });
    } catch (err) {
      next(err);
    }
  }

  async getPriceRange(req, res, next) {
    try {
      const { startRange, endRange } = req.query;
      const store = new Store(req.db);

      let priceRange;
      if (startRange && endRange) {
        priceRange = await store.getPrice(startRange, endRange);
      } else {
        priceRange = await store.getAll();
      }

      res.status(200).json({
        module: moduleName,
        data: priceRange,
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
module.exports = CartService;
