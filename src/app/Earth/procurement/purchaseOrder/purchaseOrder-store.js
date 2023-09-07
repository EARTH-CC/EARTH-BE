const { query } = require("express");
const purchaseOrderTableConfig = require("../../../../configuration/earthConfig/purchaseOrderTableConfig");

class PurchaseOrderStore {
  constructor(db) {
    this.db = db;
    this.table = purchaseOrderTableConfig.tableName;
    this.cols = purchaseOrderTableConfig.columnNames;
  }

  async add(data) {
    if (!Array.isArray(data.items)) {
      throw new Error("Invalid request format");
    }

    const insertedItems = [];
    let totalAmount = 0;
    let purchaseOrderUUID;
    const companyNameSupplier = data.company_name_supplier;

    for (const item of data.items) {
      const validItem = await this.db("product")
        .where({
          item_code: item.item_code,
        })
        .first();

      if (!validItem) {
        throw new Error("Invalid item reference");
      }

      const itemTotalAmount = item.quantity * item.price;

      const itemPrice = itemTotalAmount / item.quantity;

      const newOrder = {
        date: item.date,
        due_date: item.due_date,
        address: item.address,
        terms_of_agreement: item.terms_of_agreement,
        company_name_supplier: companyNameSupplier,
        item_code: item.item_code,
        item_name: item.item_name,
        description: validItem.description,
        quantity: item.quantity,
        price: itemPrice, // Use itemPrice as the price per item
        total_amount: itemTotalAmount,
      };

      await this.db(this.table).insert(newOrder);

      insertedItems.push({
        ...newOrder,
        company_name_supplier: companyNameSupplier,
      });

      if (!purchaseOrderUUID) {
        purchaseOrderUUID = validItem.uuid;
      }
    }

    return {
      items: insertedItems,
      total_price: totalAmount,
      uuid: purchaseOrderUUID,
      company_name_supplier: companyNameSupplier,
    };
  }

  async getAll() {
    const results = await this.db(this.table).select("*");

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

  // async getAll() {
  //   const results = await this.db(this.table)
  //     .select()
  //     .orderBy([{ column: this.cols.date, order: "desc" }]);
  //   if (!results) {
  //     return null;
  //   }
  //   const columnNames = await this.db(this.table)
  //     .columnInfo()
  //     .then((columns) => Object.keys(columns));
  //   return results.length > 0 ? convertedResults : { columnNames };
  // }

  async delete(uuid) {
    const deletedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    await this.db(this.table).where(this.cols.id, uuid).del();
    return deletedRows;
  }

  // async getMaxDate() {
  //   const result = await this.db(this.table)
  //     .max(`${this.cols.reportDate} as max_date`)
  //     .first();
  //   if (result.max_date === null) {
  //     return null;
  //   }
  //   const convertedResults = convertDatesToTimezone([result], ["max_date"]);
  //   return convertedResults[0].max_date;
  // }

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

  // async totalBeneficiary(region, startDate, endDate, search) {
  //   const formattedStartDate = formatDate(startDate);
  //   const formattedEndDate = formatDate(endDate);
  //   const maxDate = await this.getMaxDate();
  //   const firstDate = firstDateOfMonth(maxDate);
  //   const lastDate = lastDateOfMonth(maxDate);
  //   const result = await this.db(this.table)
  //     .count(`${this.cols.coopName} AS count`)
  //     .where((query) => {
  //       if (!maxDate) {
  //         query.whereRaw("false");
  //       } else if (startDate && endDate) {
  //         query.whereBetween(this.cols.reportDate, [
  //           formattedStartDate,
  //           formattedEndDate,
  //         ]);
  //       } else {
  //         query.whereBetween(this.cols.reportDate, [firstDate, lastDate]);
  //       }

  //       if (region) {
  //         query.where(this.cols.region, region);
  //       }

  //       if (search) {
  //         query.andWhere((builder) => {
  //           Object.values(this.cols).forEach((column) => {
  //             builder.orWhere(column, "like", `%${search}%`);
  //           });
  //         });
  //       }
  //     })
  //     .first();
  //   const count = result ? result.count : 0;
  //   return count;
  // }
}

// function formatDate(dateString) {
//   const date = moment(dateString, "YYYY/MM/DD", true);
//   if (!date.isValid()) {
//     return "";
//   }
//   return date.format("YYYY-MM-DD");
// }

// function convertDatesToTimezone(rows, dateFields) {
//   return rows.map((row) => {
//     const convertedFields = {};
//     dateFields.forEach((field) => {
//       const convertedDate = moment
//         .utc(row[field])
//         .tz("Asia/Singapore")
//         .format("YYYY-MM-DD");
//       convertedFields[field] = convertedDate;
//     });
//     return { ...row, ...convertedFields };
//   });
// }

// function sixMonthBehindDate(date) {
//   const sixMonthsAgo = moment(date).subtract(6, "months");
//   const firstDate = sixMonthsAgo.startOf("month").format("YYYY-MM-DD");
//   return firstDate;
// }

// function firstDateOfMonth(date) {
//   const firstDate = moment(date).startOf("month").format("YYYY-MM-DD");
//   return firstDate;
// }

// function lastDateOfMonth(date) {
//   const lastDate = moment(date).endOf("month").format("YYYY-MM-DD");
//   return lastDate;
// }

module.exports = PurchaseOrderStore;
