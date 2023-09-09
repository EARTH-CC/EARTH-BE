const { query } = require("express");
const POItemTableconfig = require("../../../../configuration/earthConfig/purchaseOrderItemTableConfig");

class PurchaseOrderItemStore {
  constructor(db) {
    this.db = db;
    this.table = POItemTableconfig.tableName;
    this.cols = POItemTableconfig.columnNames;
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

  async add(dataArray, poRef_code) {
    // Add pr_code to each object in the dataArray
    const totalAmountSum = dataArray.reduce(
      (sum, data) => sum + data.price * data.quantity,
      0
    );
    const dataWithPrCode = dataArray.map((data) => ({
      ...data,
      po_code: poRef_code,
    }));
    await this.db(this.table).insert(dataWithPrCode);
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

  //get all items
  async getAll(prRef_code) {
    try {
      const results = await this.db
        .select(
          'purchase_request_item.created_at as date',
          'purchase_request_item.item_code',
          'purchase_request_item.pr_code',
          'purchase_request_item.price',
          'purchase_request_item.quantity',
          'purchase_request_item.description',
          'product.name',
          'brand.name as brand_name',
          'supplier.name as supplier_name',
          'category.name as category_name'
        )
        .from('purchase_request_item')
        .join('product', 'purchase_request_item.item_code', '=', 'product.item_code')
        .join('brand', 'purchase_request_item.brand_id', '=', 'brand.uuid')
        .join('supplier', 'purchase_request_item.supplier_id', '=', 'supplier.uuid')
        .join('category', 'purchase_request_item.category_id', '=', 'category.uuid')
        .where('purchase_request_item.pr_code', 'like', `%${prRef_code}%`);
  
      return results;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }
  
}

module.exports = PurchaseOrderItemStore;
