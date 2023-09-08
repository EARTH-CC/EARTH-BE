const { query } = require("express");
const cartTableConfig = require("../../../../configuration/earthConfig/purchaseRequestItemTableConfig");

class CartStore {
  constructor(db) {
    this.db = db;
    this.table = cartTableConfig.tableName;
    this.cols = cartTableConfig.columnNames;
  }

  // async add(data) {
  //   return await this.db(this.table).insert({
  //     name: data.name,
  //     item_code: data.item_code,
  //     pr_code: data.pr_code,
  //     price: data.price,
  //     quantity: data.quantity,
  //     product_id: data.product_id,
  //     category_id: data.category_id,
  //     brand_id: data.brand_id,
  //     supplier_id: data.supplier_id,
  //     description: data.description,
  //   });
  // }

  async add(dataArray, prRef_code) {
    // Add pr_code to each object in the dataArray
    const totalAmountSum = dataArray.reduce(
      (sum, data) => sum + data.price * data.quantity,
      0
    );
    const dataWithPrCode = dataArray.map((data) => ({
      ...data,
      pr_code: prRef_code,
    }));
    await this.db(this.table).insert(dataWithPrCode);
    console.log(totalAmountSum);
    return totalAmountSum;
  }

  async getAllCart() {
    try {
      const results = await this.db
        .select(
          "canvass_cart.uuid",
          "canvass_cart.name",
          "canvass_cart.item_code",
          "canvass_cart.quantity",
          "canvass_cart.price",
          "canvass_cart.description",
          "canvass_cart.created_at",
          "canvass_cart.updated_at",
          "brand.name as brand",
          "supplier.name as supplier"
        )
        .from("canvass_cart")
        .join("product", "product.item_code", "=", "canvass_cart.item_code")
        .join("brand", "product.brand_id", "=", "brand.uuid")
        .join("supplier", "product.supplier_id", "=", "supplier.uuid");

      return results;
    } catch (error) {
      // Handle any potential errors here
      console.error("Error in getAll:", error);
      throw error; // You can choose to rethrow the error or handle it differently
    }
  }

  async getCartPrice() {
    try {
      const result = await this.db(this.table)
        .select(this.db.raw("SUM(price * quantity) as total_price"))
        .count(`${this.cols.id} as items`)
        .first();
      if (result && result.total_price !== null && result.items !== null) {
        return result;
      } else {
        return { total_price: 0, items: 0 };
      }
    } catch (error) {
      console.error("Error calculating cart price:", error);
      throw error;
    }
  }
}

module.exports = CartStore;
