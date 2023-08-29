const { query } = require("express");
const productTableConfig = require("../../../../configuration/earthConfig/productTableConfig");


class ProductStore {
  constructor(db) {
    this.db = db;
    this.table = productTableConfig.tableName;
    this.cols = productTableConfig.columnNames;
  }

  async add(data) {
    const newProduct = {
      item_code: data.item_code,
      brand_id: data.brand_id,
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      name: data.name,
      description: data.description,
      added_by: data.added_by,
    };
    // Insert the new product into the database
    const insertedProduct = await this.db(this.table).insert(newProduct);
  
    // Return the modified newProduct object
    return {
      ...newProduct,
      uuid: insertedProduct[0], // Assuming your database returns the inserted ID
    };
  }

  async getSupplierById(supplierId) {
    return await this.db('supplier').select('name').where('uuid', supplierId).first();
  }

  async getCategoryById(categoryId) {
    return await this.db('category').select('name').where('uuid', categoryId).first();
  }

  async getBrandById(brandId) {
    return await this.db('brand').select('name').where('uuid', brandId).first();
  }

  async getAll() {
    const results = await this.db(this.table)
      .select(
        'product.uuid',
        'product.name',
        'product.item_code',
        'product.description',
        'product.status',
        'product.created_at',
        'product.updated_at',
        'product.added_by',
        'brand.name as brand_name',
        'category.name as category_name',
        'supplier.name as supplier_name'
      )
      .join('brand', 'product.brand_id', '=', 'brand.uuid')
      .join('category', 'product.category_id', '=', 'category.uuid')
      .join('supplier', 'product.supplier_id', '=', 'supplier.uuid');
  
    return results;
  }

  async update(uuid, body) {
    // Perform the update operation
    await this.db(this.table).where(this.cols.id, uuid).update({
      item_code: body.item_code,
      brand_id: body.brand_id,
      category_id: body.category_id,
      supplier_id: body.supplier_id,
      name: body.name,
      description: body.description,
      added_by: body.added_by,
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

module.exports = ProductStore;
