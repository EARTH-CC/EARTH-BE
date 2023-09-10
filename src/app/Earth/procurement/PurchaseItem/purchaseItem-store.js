const { query } = require("express");
const purchaseItemTableConfig = require("../../../../configuration/procurement/purchaseItemTableConfig");

class PurchaseItemStore {
  constructor(db) {
    this.db = db;
    this.table = purchaseItemTableConfig.tableName;
    this.cols = purchaseItemTableConfig.columnNames;
  }

  async add(dataArray, refCode) {
    return new Promise(async (resolve, reject) => {
      try {
        const dataWithPrCode = dataArray.map((data) => ({
          ...data,
          ref_code: refCode,
        }));
        const result = await this.db(this.table).insert(dataWithPrCode);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  //get all items
  async getAll(prRef_code) {
    try {
      const results = await this.db
        .select(
          "purchase_item.created_at as date",
          "purchase_item.item_code",
          "purchase_item.ref_code",
          "purchase_item.price",
          "purchase_item.quantity",
          "purchase_item.description",
          "product.name",
          "brand.name as brand_name",
          "supplier.name as supplier_name",
          "category.name as category_name"
        )
        .from("purchase_item")
        .join("product", "purchase_item.item_code", "=", "product.item_code")
        .join("brand", "purchase_item.brand_id", "=", "brand.uuid")
        .join("supplier", "purchase_item.supplier_id", "=", "supplier.uuid")
        .join("category", "purchase_item.category_id", "=", "category.uuid")
        .where("purchase_item.pr_code", "like", `%${prRef_code}%`);

      return results;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }
}

module.exports = PurchaseItemStore;
