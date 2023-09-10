const Store = require("./canvass-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Canvass";
const userId = 1;

class CanvassService {
  constructor(store) {}

  // Add
  async add(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const data = req.body;

      for (const row of data) {
        await store.add(row);
      }

      res.status(201).json({
        message: "Canvass added successfully",
        uuid: userId,
        module: moduleName,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  }

  //Get All Data
  async getAllCart(req, res, next) {
    try {
      let result = [];
      const store = new Store(req.db);
      result = await store.getAllCart();

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

  //Get Cart Total Price
  async getCartPrice(req, res, next) {
    try {
      let result = [];
      const store = new Store(req.db);
      result = await store.getCartPrice();

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
}
module.exports = CanvassService;
