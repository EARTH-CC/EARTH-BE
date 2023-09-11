const { query } = require("express");
const purchaseTableConfig = require("../../../../configuration/procurement/purchaseTableConfig");

class PurchaseStore {
  constructor(db) {
    this.db = db;
    this.table = purchaseTableConfig.tableName;
    this.cols = purchaseTableConfig.columnNames;
  }

  async add(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.db(this.table).insert({
          ref_code: data.ref_code,
          pr_code: data.pr_code,
          company_name: data.company_name,
          address: data.address,
          item_count: data.item_count,
          total_amount: data.total_amount,
          remarks: data.remarks,
          attention: data.attention,
          request_date: data.request_date,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

async getMaxUUID() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await this.db(this.table).max('uuid as max_uuid').first();
      const maxUUID = result.max_uuid || 0; // Default to 0 if no result is found
      resolve(maxUUID + 1);
    } catch (error) {
      reject(error);
    }
  });
}

  async getAll(processType) {
    const results = await this.db(this.table)
      .select()
      .where(this.cols.processType, "=", processType.processName);
    return results;
  }

  async update(uuid, body) {
    const validItem = await this.db("purchase_items")
      .where({
        item_name: body.item_name,
        item_type: body.item_type,
        description: body.description,
      })
      .first();

    if (!validItem) {
      throw new Error("Invalid item references");
    }
    // Perform the update operation
    await this.db(this.table).where(this.cols.id, uuid).update({
      date: body.date,
      company_name: body.company_name,
      address: body.address,
      attention: body.attention,
      item_name: body.item_name,
      item_type: body.item_type,
      description: body.description,
      quantity: body.quantity,
      unit: body.unit,
      unit_cost: body.unit_cost,
      amount: body.amount,
      remarks: body.remarks,
    });

    // Fetch the updated rows
    const updatedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    return updatedRows;
  }

  async getByUUID(uuid) {
    const results = await this.db(this.table)
      .select()
      .where(this.cols.id, uuid);
    return results;
  }

  async delete(uuid) {
    const deletedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    await this.db(this.table).where(this.cols.id, uuid).del();
    return deletedRows;
  }

  async search(startDate, endDate, search) {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const maxDate = await this.getMaxDate();
    // const firstDate = firstDateOfMonth(maxDate);
    // const lastDate = lastDateOfMonth(maxDate);
    const query = this.db(this.table)
      .select()
      .orderBy([{ column: this.cols.startDate, order: "desc" }]);
    if (!maxDate) {
      return [];
    }
    if (startDate && endDate) {
      query.whereBetween(this.cols.startDate, [
        formattedStartDate,
        formattedEndDate,
      ]);
    } else {
      query.whereBetween(this.cols.startDate, [firstDate, lastDate]);
    }
    if (search) {
      const columns = await this.db(this.table).columnInfo();
      query.andWhere((builder) => {
        builder.where((innerBuilder) => {
          Object.keys(columns).forEach((column) => {
            innerBuilder.orWhere(column, "like", `%${search}%`);
          });
        });
      });
    }
    const results = await query;
    const convertedResults = convertDatesToTimezone(
      results.map((row) => row),
      [this.cols.startDate]
    );
    return convertedResults;
  }
}

module.exports = PurchaseStore;
