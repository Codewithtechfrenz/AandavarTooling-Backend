const { Validator } = require("node-input-validator");
const db = require('../models/db.js');
//const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");

// Create Item
exports.createItem = (req, res) => {
    const reqData = req.body;

    // Updated validator to use CategoryName and UOMName
    const v = new Validator(reqData, {
        ItemName: 'required|string|maxLength:150',
        ItemCode: 'required|string|maxLength:50',
        CategoryName: 'required|string|maxLength:100',
        MinStock: 'required|integer|min:0',
        UOMName: 'required|string|maxLength:50',
        Status: 'required|string|in:Active,Inactive'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const insertQuery = `INSERT INTO item_master 
            (ItemName, ItemCode, CategoryName, MinStock, UOMName, Status) 
            VALUES (?, ?, ?, ?, ?, ?)`;

        db.mainDb(insertQuery, [
            reqData.ItemName,
            reqData.ItemCode,
            reqData.CategoryName,
            reqData.MinStock,
            reqData.UOMName,
            reqData.Status
        ], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.json({ status: 0, message: "ItemCode already exists" });
                }
                return res.json({ status: 0, message: "DB error" });
            }
            return res.json({ status: 1, message: "Item created successfully", SI: result.insertId });
        });
    });
};

// List Items
exports.getItems = (req, res) => {
    db.mainDb(`SELECT * FROM item_master ORDER BY SI ASC`, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        return res.json({ status: 1, data: result });
    });
};

// Get Item
exports.getItem = (req, res) => {
    const SI = req.params.SI;
    db.mainDb(`SELECT * FROM item_master WHERE SI = ?`, [SI], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        if (result.length === 0) return res.json({ status: 0, message: "Item not found" });
        return res.json({ status: 1, data: result[0] });
    });
};



// Update Item (POST Method)
exports.updateItem = (req, res) => {
    const reqData = req.body;

    console.log("UPDATE REQUEST:", reqData);

    const v = new Validator(reqData, {
        SI: 'required|integer',
        ItemName: 'required|string|maxLength:150',
        ItemCode: 'required|string|maxLength:50',
        CategoryName: 'required|string|maxLength:100',
        MinStock: 'required|integer|min:0',
        UOMName: 'required|string|maxLength:50',
        Status: 'required|string|in:Active,Inactive'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors)
                .map(e => e.message)
                .join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const updateQuery = `
            UPDATE item_master 
            SET ItemName=?, ItemCode=?, CategoryName=?, MinStock=?, UOMName=?, Status=? 
            WHERE SI=?`;

        db.mainDb(
            updateQuery,
            [
                reqData.ItemName,
                reqData.ItemCode,
                reqData.CategoryName,
                reqData.MinStock,
                reqData.UOMName,
                reqData.Status,
                reqData.SI
            ],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.json({ status: 0, message: "DB error" });
                }

                if (result.affectedRows === 0) {
                    return res.json({ status: 0, message: "Item not found" });
                }

                return res.json({
                    status: 1,
                    message: "Item updated successfully"
                });
            }
        );
    });
};

// Delete Item
exports.deleteItem = (req, res) => {
    const SI = req.body.SI; // ✅ from body

    if (!SI) {
        return res.json({ status: 0, message: "SI is required" });
    }

    db.mainDb(
        `DELETE FROM item_master WHERE SI=?`,
        [SI],
        (err, result) => {
            if (err) {
                return res.json({ status: 0, message: "DB error" });
            }

            if (result.affectedRows === 0) {
                return res.json({ status: 0, message: "Item not found" });
            }

            return res.json({ status: 1, message: "Item deleted successfully" });
        }
    );
};


//------------------------------------------------------------------------------------


// CREATE TOOL
exports.createTool = (req, res) => {
    const data = req.body;

    const query = `
        INSERT INTO tool_master 
        (ToolName, ToolCode, CategoryName, MinStock, UOMName, Status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.mainDb(
        query,
        [
            data.ToolName || null,
            data.ToolCode || null,
            data.CategoryName || null,
            data.MinStock || 0,
            data.UOMName || null,
            data.Status || "Active"
        ],
        (err, result) => {
            if (err) {
                return res.json({
                    status: 0,
                    message: "Insert failed",
                    error: err
                });
            }

            return res.json({
                status: 1,
                message: "Tool created successfully",
                SI: result.insertId
            });
        }
    );
};


/* ================= GET ALL TOOLS ================= */
exports.getTools = (req, res) => {

    const query = `SELECT * FROM tool_master ORDER BY SI ASC`;

    db.mainDb(query, [], (err, result) => {
        if (err) {
            return res.json({
                status: 0,
                message: "Fetch failed"
            });
        }

        return res.json({
            status: 1,
            data: result
        });
    });
};


/* ================= UPDATE TOOL ================= */
exports.updateTool = (req, res) => {
    const data = req.body;

    const query = `
        UPDATE tool_master SET
        ToolName = ?,
        ToolCode = ?,
        CategoryName = ?,
        MinStock = ?,
        UOMName = ?,
        Status = ?
        WHERE SI = ?
    `;

    db.mainDb(
        query,
        [
            data.ToolName || null,
            data.ToolCode || null,
            data.CategoryName || null,
            data.MinStock || 0,
            data.UOMName || null,
            data.Status || "Active",
            data.SI
        ],
        (err, result) => {
            if (err) {
                return res.json({
                    status: 0,
                    message: "Update failed",
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    status: 0,
                    message: "Tool not found"
                });
            }

            return res.json({
                status: 1,
                message: "Tool updated successfully"
            });
        }
    );
};


/* ================= DELETE TOOL ================= */
exports.deleteTool = (req, res) => {
    const { SI } = req.body;

    const query = `DELETE FROM tool_master WHERE SI = ?`;

    db.mainDb(query, [SI], (err, result) => {
        if (err) {
            return res.json({
                status: 0,
                message: "Delete failed",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.json({
                status: 0,
                message: "Tool not found"
            });
        }

        return res.json({
            status: 1,
            message: "Tool deleted successfully"
        });
    });
};


//------------------------------------------------------------------------------------


/* ================= CREATE INSTRUMENT ================= */
exports.createInstrument = (req, res) => {
  const data = req.body;

  const query = `
    INSERT INTO instrument_master 
    (InstrumentName, InstrumentCode, CategoryName, MinStock, UOMName, Status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.mainDb(
    query,
    [
      data.InstrumentName || null,
      data.InstrumentCode || null,
      data.CategoryName || null,
      data.MinStock || 0,
      data.UOMName || null,
      data.Status || "Active",
    ],
    (err, result) => {
      if (err) {
        console.log("INSERT ERROR:", err);
        return res.json({
          status: 0,
          message: "Insert failed",
          error: err.sqlMessage,
        });
      }

      return res.json({
        status: 1,
        message: "Instrument created successfully",
        SI: result.insertId,
      });
    }
  );
};


/* ================= GET ALL INSTRUMENTS ================= */
exports.getInstruments = (req, res) => {
  const query = `SELECT * FROM instrument_master ORDER BY SI ASC`;

  db.mainDb(query, [], (err, result) => {
    if (err) {
      console.log("FETCH ERROR:", err);
      return res.json({
        status: 0,
        message: "Fetch failed",
      });
    }

    return res.json({
      status: 1,
      data: result,
    });
  });
};


/* ================= UPDATE INSTRUMENT ================= */
exports.updateInstrument = (req, res) => {
  const data = req.body;

  const query = `
    UPDATE instrument_master SET
    InstrumentName = ?,
    InstrumentCode = ?,
    CategoryName = ?,
    MinStock = ?,
    UOMName = ?,
    Status = ?
    WHERE SI = ?
  `;

  db.mainDb(
    query,
    [
      data.InstrumentName || null,
      data.InstrumentCode || null,
      data.CategoryName || null,
      data.MinStock || 0,
      data.UOMName || null,
      data.Status || "Active",
      data.SI,
    ],
    (err, result) => {
      if (err) {
        console.log("UPDATE ERROR:", err);
        return res.json({
          status: 0,
          message: "Update failed",
          error: err.sqlMessage,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          status: 0,
          message: "Instrument not found",
        });
      }

      return res.json({
        status: 1,
        message: "Instrument updated successfully",
      });
    }
  );
};


/* ================= DELETE INSTRUMENT ================= */
exports.deleteInstrument = (req, res) => {
  const { SI } = req.body;

  const query = `DELETE FROM instrument_master WHERE SI = ?`;

  db.mainDb(query, [SI], (err, result) => {
    if (err) {
      console.log("DELETE ERROR:", err);
      return res.json({
        status: 0,
        message: "Delete failed",
        error: err.sqlMessage,
      });
    }

    if (result.affectedRows === 0) {
      return res.json({
        status: 0,
        message: "Instrument not found",
      });
    }

    return res.json({
      status: 1,
      message: "Instrument deleted successfully",
    });
  });
};






//------------------------------------------------------------------------------------------



// Create Category
exports.createCategory = (req, res) => {
    const reqData = req.body;

    const v = new Validator(reqData, {
        CategoryName: 'required|string|maxLength:150',
        CategoryCode: 'required|string|maxLength:50',
        Description: 'string'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        db.mainDb(
            `INSERT INTO Category_Master (CategoryName, CategoryCode, Description) VALUES (?, ?, ?)`,
            [
                reqData.CategoryName,
                reqData.CategoryCode,
                reqData.Description || null
            ],
            (err, result) => {
                console.log(err);
                if (err) {
                    if (err.code === "ER_DUP_ENTRY")
                        return res.json({ status: 0, message: "CategoryCode already exists" });

                    return res.json({ status: 0, message: "DB error" });
                }

                return res.json({
                    status: 1,
                    message: "Category created successfully",
                    SI: result.insertId
                });
            }
        );
    });
};




// List Categories
exports.getCategories = (req, res) => {
    db.mainDb(
        `SELECT * FROM Category_Master ORDER BY SI asc`,
        [],
        (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });
            return res.json({ status: 1, data: result });
        }
    );
};




// Get single Category
exports.getCategory = (req, res) => {
    const CategoryID = req.params.CategoryID;
    db.mainDb(`SELECT * FROM Category_Master WHERE CategoryID = ?`, [CategoryID], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        if (result.length === 0) return res.json({ status: 0, message: "Category not found" });
        return res.json({ status: 1, data: result[0] });
    });
};



// Update Category
exports.updateCategory = (req, res) => {
    const reqData = req.body;
    const SI = reqData.SI;

    if (!SI) {
        return res.json({ status: 0, message: "SI is required" });
    }

    const v = new Validator(reqData, {
        SI: 'required|integer',
        CategoryName: 'required|string|maxLength:150',
        CategoryCode: 'required|string|maxLength:50',
        Description: 'string'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        db.mainDb(
            `UPDATE Category_Master 
             SET CategoryName=?, CategoryCode=?, Description=? 
             WHERE SI=?`,
            [
                reqData.CategoryName,
                reqData.CategoryCode,
                reqData.Description || null,
                SI
            ],
            (err, result) => {

                if (err) {
                    if (err.code === "ER_DUP_ENTRY")
                        return res.json({ status: 0, message: "CategoryCode already exists" });

                    return res.json({ status: 0, message: "DB error" });
                }

                if (result.affectedRows === 0) {
                    return res.json({ status: 0, message: "Category not found" });
                }

                return res.json({ status: 1, message: "Category updated successfully" });
            }
        );
    });
};




// Delete Category
exports.deleteCategory = (req, res) => {
    const SI = req.body.SI;

    if (!SI) {
        return res.json({ status: 0, message: "SI is required" });
    }

    db.mainDb(
        `DELETE FROM Category_Master WHERE SI=?`,
        [SI],
        (err, result) => {

            if (err) return res.json({ status: 0, message: "DB error" });

            if (result.affectedRows === 0) {
                return res.json({ status: 0, message: "Category not found" });
            }

            return res.json({ status: 1, message: "Category deleted successfully" });
        }
    );
};





//---------------------------------------------------------------------------------------------------










// Create UOM
exports.createUOM = (req, res) => {
    const reqData = req.body;

    const v = new Validator(reqData, {
        UOMCode: 'required|string|maxLength:50',
        UOMName: 'required|string|maxLength:100'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        db.mainDb(
            `INSERT INTO UOM_Master (UOMCode, UOMName) VALUES (?, ?)`,
            [reqData.UOMCode, reqData.UOMName],
            (err, result) => {

                if (err) {
                    if (err.code === "ER_DUP_ENTRY")
                        return res.json({ status: 0, message: "UOM Code already exists" });

                    return res.json({ status: 0, message: "DB error" });
                }

                return res.json({
                    status: 1,
                    message: "UOM created successfully",
                    SI: result.insertId
                });
            }
        );
    });
};






// List UOMs
exports.getUOMs = (req, res) => {
    db.mainDb(
        `SELECT * FROM UOM_Master ORDER BY SI asc`,
        [],
        (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            return res.json({ status: 1, data: result });
        }
    );
};





// Get single UOM
exports.getUOM = (req, res) => {
    const SI = req.body.SI;

    if (!SI) {
        return res.json({ status: 0, message: "SI is required" });
    }

    db.mainDb(
        `SELECT * FROM UOM_Master WHERE SI = ?`,
        [SI],
        (err, result) => {

            if (err) return res.json({ status: 0, message: "DB error" });

            if (result.length === 0)
                return res.json({ status: 0, message: "UOM not found" });

            return res.json({ status: 1, data: result[0] });
        }
    );
};






// Update UOM
exports.updateUOM = (req, res) => {
    const reqData = req.body;
    const SI = reqData.SI;

    if (!SI) {
        return res.json({ status: 0, message: "SI is required" });
    }

    const v = new Validator(reqData, {
        SI: 'required|integer',
        UOMCode: 'required|string|maxLength:50',
        UOMName: 'required|string|maxLength:100'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        db.mainDb(
            `UPDATE UOM_Master SET UOMCode=?, UOMName=? WHERE SI=?`,
            [reqData.UOMCode, reqData.UOMName, SI],
            (err, result) => {

                if (err) {
                    if (err.code === "ER_DUP_ENTRY")
                        return res.json({ status: 0, message: "UOM Code already exists" });

                    return res.json({ status: 0, message: "DB error" });
                }

                if (result.affectedRows === 0) {
                    return res.json({ status: 0, message: "UOM not found" });
                }

                return res.json({ status: 1, message: "UOM updated successfully" });
            }
        );
    });
};



// Delete UOM
exports.deleteUOM = (req, res) => {
    const SI = req.body.SI;

    if (!SI) {
        return res.json({ status: 0, message: "SI is required" });
    }

    db.mainDb(
        `DELETE FROM UOM_Master WHERE SI=?`,
        [SI],
        (err, result) => {

            if (err) return res.json({ status: 0, message: "DB error" });

            if (result.affectedRows === 0) {
                return res.json({ status: 0, message: "UOM not found" });
            }

            return res.json({ status: 1, message: "UOM deleted successfully" });
        }
    );
};





//------------------------------------------------------------------------------------




// Create Worker
// Create Worker
exports.createWorker = (req, res) => {
    const reqData = req.body;

    const v = new Validator(reqData, {
        WorkerCode: 'required|string|maxLength:50',
        WorkerName: 'required|string|maxLength:150',
        WorkerDepartment: 'sometimes|string|maxLength:100',
        WorkerJoiningDate: 'sometimes|date',
        Salary: 'sometimes|numeric', // ✅ added
        Status: 'sometimes|string|in:Active,Inactive'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const insertQuery = `INSERT INTO Worker_Master (WorkerCode, WorkerName, WorkerDepartment, WorkerJoiningDate, Salary) VALUES (?, ?, ?, ?, ?)`; // ✅ added Salary

        db.mainDb(insertQuery, [
            reqData.WorkerCode,
            reqData.WorkerName,
            reqData.WorkerDepartment || null,
            reqData.WorkerJoiningDate || null,
            reqData.Salary || 0 // ✅ added
        ], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") return res.json({ status: 0, message: "WorkerCode already exists" });
                return res.json({ status: 0, message: "DB error" });
            }
            return res.json({ status: 1, message: "Worker created successfully", SI: result.insertId });
        });
    });
};

// List Workers
exports.getWorkers = (req, res) => {
    db.mainDb(`SELECT * FROM Worker_Master ORDER BY SI asc`, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        return res.json({ status: 1, data: result });
    });
};

// Get single Worker
exports.getWorker = (req, res) => {
    const { SI } = req.body;
    if (!SI) return res.json({ status: 0, message: "SI is required" });

    db.mainDb(`SELECT * FROM Worker_Master WHERE SI = ?`, [SI], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        if (result.length === 0) return res.json({ status: 0, message: "Worker not found" });
        return res.json({ status: 1, data: result[0] });
    });
};

// Update Worker
exports.updateWorker = (req, res) => {
    const { SI, WorkerCode, WorkerName, WorkerDepartment, WorkerJoiningDate, Salary } = req.body; // ✅ added Salary

    if (!SI) return res.json({ status: 0, message: "SI is required" });

    const v = new Validator({ WorkerCode, WorkerName, WorkerDepartment, WorkerJoiningDate, Salary }, {
        WorkerCode: 'required|string|maxLength:50',
        WorkerName: 'required|string|maxLength:150',
        WorkerDepartment: 'sometimes|string|maxLength:100',
        WorkerJoiningDate: 'sometimes|date',
        Salary: 'sometimes|numeric' // ✅ added
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        db.mainDb(
            `UPDATE Worker_Master 
             SET WorkerCode=?, WorkerName=?, WorkerDepartment=?, WorkerJoiningDate=?, Salary=? 
             WHERE SI=?`, // ✅ added Salary
            [
                WorkerCode,
                WorkerName,
                WorkerDepartment || null,
                WorkerJoiningDate || null,
                Salary || 0, // ✅ added
                SI
            ],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") return res.json({ status: 0, message: "WorkerCode already exists" });
                    return res.json({ status: 0, message: "DB error" });
                }
                return res.json({ status: 1, message: "Worker updated successfully" });
            }
        );
    });
};

// Delete Worker
exports.deleteWorker = (req, res) => {
    const { SI } = req.body;
    if (!SI) return res.json({ status: 0, message: "SI is required" });

    db.mainDb(`DELETE FROM Worker_Master WHERE SI=?`, [SI], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        return res.json({ status: 1, message: "Worker deleted successfully" });
    });
};



//------------------------------------------------------------------------------------






// Create Customer
exports.createCustomer = (req, res) => {
    const { Cus_Name, Cus_Address, Cus_Phno, Cus_GSTIN } = req.body;

    const v = new Validator({ Cus_Name, Cus_Phno }, {
        Cus_Name: 'required|string|maxLength:150',
        Cus_Phno: 'required|string|maxLength:20',
        Cus_Address: 'sometimes|string|maxLength:250',
        Cus_GSTIN: 'sometimes|string|maxLength:20'
    });

    v.check().then((matched) => {
        if (!matched) {
            const msg = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: msg });
        }

        const query = `INSERT INTO Customer_Master (Cus_Name, Cus_Address, Cus_Phno, Cus_GSTIN) VALUES (?, ?, ?, ?)`;
        db.mainDb(query, [Cus_Name, Cus_Address || null, Cus_Phno, Cus_GSTIN || null], (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });
            res.json({ status: 1, message: "Customer created successfully", S_No: result.insertId });
        });
    });
};

// List Customers
exports.getCustomers = (req, res) => {
    db.mainDb(`SELECT * FROM Customer_Master ORDER BY S_No DESC`, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        res.json({ status: 1, data: result });
    });
};

// Get single Customer
exports.getCustomer = (req, res) => {
    const { S_No } = req.body;
    if (!S_No) return res.json({ status: 0, message: "S_No is required" });

    db.mainDb(`SELECT * FROM Customer_Master WHERE S_No=?`, [S_No], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        if (result.length === 0) return res.json({ status: 0, message: "Customer not found" });
        res.json({ status: 1, data: result[0] });
    });
};

// Update Customer
exports.updateCustomer = (req, res) => {
    const { S_No, Cus_Name, Cus_Address, Cus_Phno, Cus_GSTIN } = req.body;
    if (!S_No) return res.json({ status: 0, message: "S_No is required" });

    const v = new Validator({ Cus_Name, Cus_Phno }, {
        Cus_Name: 'required|string|maxLength:150',
        Cus_Phno: 'required|string|maxLength:20',
        Cus_Address: 'sometimes|string|maxLength:250',
        Cus_GSTIN: 'sometimes|string|maxLength:20'
    });

    v.check().then((matched) => {
        if (!matched) {
            const msg = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: msg });
        }

        const query = `UPDATE Customer_Master SET Cus_Name=?, Cus_Address=?, Cus_Phno=?, Cus_GSTIN=? WHERE S_No=?`;
        db.mainDb(query, [Cus_Name, Cus_Address || null, Cus_Phno, Cus_GSTIN || null, S_No], (err) => {
            if (err) return res.json({ status: 0, message: "DB error" });
            res.json({ status: 1, message: "Customer updated successfully" });
        });
    });
};

// Delete Customer
exports.deleteCustomer = (req, res) => {
    const { S_No } = req.body;
    if (!S_No) return res.json({ status: 0, message: "S_No is required" });

    db.mainDb(`DELETE FROM Customer_Master WHERE S_No=?`, [S_No], (err) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        res.json({ status: 1, message: "Customer deleted successfully" });
    });
};







//------------------------------------------------------------------------------------




// Create Sales Product
// Create Sales Product
exports.createSalesProduct = (req, res) => {
    const reqData = req.body;
    const v = new Validator(reqData, {
        Product_Name: 'required|string|maxLength:150'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const insertQuery = `INSERT INTO Sales_Product_Master (Product_Name) VALUES (?)`;
        db.mainDb(insertQuery, [reqData.Product_Name], (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });
            return res.json({ status: 1, message: "Sales product created successfully", S_No: result.insertId });
        });
    });
};

// List Sales Products
// exports.getSalesProducts = (req, res) => {
//     db.mainDb(`SELECT * FROM Sales_Product_Master ORDER BY S_No DESC`, [], (err, result) => {
//         if (err) return res.json({ status: 0, message: "DB error" });
//         return res.json({ status: 1, data: result });
//     });
// };

// // Get single Sales Product
// exports.getSalesProduct = (req, res) => {
//     const S_No = req.body.S_No;
//     db.mainDb(`SELECT * FROM Sales_Product_Master WHERE S_No = ?`, [S_No], (err, result) => {
//         if (err) return res.json({ status: 0, message: "DB error" });
//         if (result.length === 0) return res.json({ status: 0, message: "Product not found" });
//         return res.json({ status: 1, data: result[0] });
//     });
// };

// Update Sales Product
// exports.updateSalesProduct = (req, res) => {
//     const S_No = req.body.S_No;
//     const reqData = req.body;
//     const v = new Validator(reqData, {
//         Product_Name: 'required|string|maxLength:150'
//     });

//     v.check().then((matched) => {
//         if (!matched) {
//             const error_message = Object.values(v.errors).map(e => e.message).join(", ");
//             return res.json({ status: 0, message: error_message });
//         }

//         db.mainDb(`UPDATE Sales_Product_Master SET Product_Name=? WHERE S_No=?`,
//             [reqData.Product_Name, S_No],
//             (err, result) => {
//                 if (err) return res.json({ status: 0, message: "DB error" });
//                 return res.json({ status: 1, message: "Sales product updated successfully" });
//             });
//     });
// };

// // Delete Sales Product
// exports.deleteSalesProduct = (req, res) => {
//     const S_No = req.body.S_No;
//     db.mainDb(`DELETE FROM Sales_Product_Master WHERE S_No=?`, [S_No], (err, result) => {
//         if (err) return res.json({ status: 0, message: "DB error" });
//         return res.json({ status: 1, message: "Sales product deleted successfully" });
//     });
// };


//------------------------------------------------------------------------------------



// Create Machine
exports.createMachine = (req, res) => {
    const reqData = req.body;
    const v = new Validator(reqData, {
        MachineCode: 'required|string|maxLength:50',
        MachineName: 'required|string|maxLength:150',
        Department: 'sometimes|string|maxLength:100'
    });

    v.check().then(matched => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const insertQuery = `INSERT INTO machine_master (MachineCode, MachineName, Department) VALUES (?, ?, ?)`;
        db.mainDb(insertQuery, [reqData.MachineCode, reqData.MachineName, reqData.Department || null], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") return res.json({ status: 0, message: "Machine code already exists" });
                return res.json({ status: 0, message: "DB error" });
            }
            return res.json({ status: 1, message: "Machine created successfully", SI: result.insertId });
        });
    });
};

// List Machines
exports.getMachines = (req, res) => {
    db.mainDb(`SELECT * FROM machine_master ORDER BY SI DESC`, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        return res.json({ status: 1, data: result });
    });
};

// Get Single Machine
exports.getMachine = (req, res) => {
    const { SI } = req.body;
    db.mainDb(`SELECT * FROM machine_master WHERE SI = ?`, [SI], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        if (result.length === 0) return res.json({ status: 0, message: "Machine not found" });
        return res.json({ status: 1, data: result[0] });
    });
};

// Update Machine
exports.updateMachine = (req, res) => {
    const { SI, MachineCode, MachineName, Department } = req.body;
    const v = new Validator({ MachineCode, MachineName }, {
        MachineCode: 'required|string|maxLength:50',
        MachineName: 'required|string|maxLength:150',
        Department: 'sometimes|string|maxLength:100'
    });

    v.check().then(matched => {
        if (!matched) {
            const error_message = Object.values(v.errors).map(e => e.message).join(", ");
            return res.json({ status: 0, message: error_message });
        }

        db.mainDb(
            `UPDATE machine_master SET MachineCode=?, MachineName=?, Department=? WHERE SI=?`,
            [MachineCode, MachineName, Department || null, SI],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") return res.json({ status: 0, message: "Machine code already exists" });
                    return res.json({ status: 0, message: "DB error" });
                }
                return res.json({ status: 1, message: "Machine updated successfully" });
            }
        );
    });
};

// Delete Machine
exports.deleteMachine = (req, res) => {
    const { SI } = req.body;
    db.mainDb(`DELETE FROM machine_master WHERE SI=?`, [SI], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        return res.json({ status: 1, message: "Machine deleted successfully" });
    });
};







//------------------------------------------------------------------------------------





// exports.createItemInward = (req, res) => {
//     const { ItemName, UOMName, Quantity, Rate, Status } = req.body;

//     const query = `
//         INSERT INTO Item_Inward 
//         (ItemName, UOMName, Quantity, Rate, Status)
//         VALUES (?, ?, ?, ?, ?)
//     `;

//     db.mainDb(query, [ItemName, UOMName, Quantity, Rate, Status], async (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.json({ status: 0, message: "DB Error" });
//         }

//         try {
//             if (Status === "Completed") {
//                 await updateStock(ItemName, UOMName, Quantity);
//             }

//             res.json({
//                 status: 1,
//                 message: "Inward created & stock updated"
//             });

//         } catch (error) {
//             console.error(error);
//             res.json({
//                 status: 0,
//                 message: "Stock update failed"
//             });
//         }
//     });
// };






function updateStock(ItemName, UOMName, qtyChange) {
    return new Promise((resolve, reject) => {

        const checkQuery = `
      SELECT StockID, AvailableQty 
      FROM current_stock 
      WHERE ItemName = ? AND UOMName = ?
    `;

        db.mainDb(checkQuery, [ItemName, UOMName], (err, result) => {
            if (err) return reject(err);

            if (result.length > 0) {
                const updateQuery = `
          UPDATE current_stock
          SET AvailableQty = AvailableQty + ?,
              LastUpdated = NOW()
          WHERE StockID = ?
        `;

                db.mainDb(updateQuery, [qtyChange, result[0].StockID], (err2) => {
                    if (err2) return reject(err2);
                    resolve();
                });

            } else {
                const insertQuery = `
          INSERT INTO current_stock 
          (ItemName, UOMName, AvailableQty)
          VALUES (?, ?, ?)
        `;

                db.mainDb(insertQuery, [ItemName, UOMName, qtyChange], (err2) => {
                    if (err2) return reject(err2);
                    resolve();
                });
            }
        });
    });
}
//-=====================--------------------------==================------------------






// Line Feed Out
exports.createLineFeedOut = (req, res) => {
    const { ItemName, UOMName, Quantity, Status, WorkerName, MachineName } = req.body;

    const v = new Validator(req.body, {
        ItemName: 'required|string|maxLength:150',
        UOMName: 'required|string|maxLength:50',
        Quantity: 'required|integer|min:1',
        Status: 'required|string|in:Pending,Completed',
        WorkerName: 'sometimes|string|maxLength:150',
        MachineName: 'sometimes|string|maxLength:150'
    });

    v.check().then(async matched => {
        if (!matched) return res.json({ status: 0, message: Object.values(v.errors).map(e => e.message).join(", ") });

        const query = `INSERT INTO line_feed_out 
            (ItemName, UOMName, Quantity, Status, WorkerName, MachineName)
            VALUES (?, ?, ?, ?, ?, ?)`;

        db.mainDb(query, [ItemName, UOMName, Quantity, Status, WorkerName || null, MachineName || null], async (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            if (Status === 'Completed') {
                try { await updateStock(ItemName, UOMName, -Quantity); } // Subtract from stock
                catch (errStock) { console.error("Stock update error:", errStock); }
            }

            res.json({ status: 1, message: "Line feed out created successfully", OutID: result.insertId });
        });
    });
};

// Line Return
exports.createLineReturn = (req, res) => {
    const { ItemName, UOMName, Quantity, Rate, Status, WorkerName, MachineName, Description } = req.body;

    const v = new Validator(req.body, {
        ItemName: 'required|string|maxLength:150',
        UOMName: 'required|string|maxLength:50',
        Quantity: 'required|integer|min:1',
        Rate: 'required|decimal',
        Status: 'required|string|in:Pending,Completed',
        WorkerName: 'sometimes|string|maxLength:150',
        MachineName: 'sometimes|string|maxLength:150',
        Description: 'sometimes|string|maxLength:250'
    });

    v.check().then(async matched => {
        if (!matched) return res.json({ status: 0, message: Object.values(v.errors).map(e => e.message).join(", ") });

        const query = `INSERT INTO line_feed_in 
            (ItemName, UOMName, Quantity, Rate, Status, WorkerName, MachineName, Description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.mainDb(query, [ItemName, UOMName, Quantity, Rate, Status, WorkerName || null, MachineName || null, Description || null], async (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            if (Status === 'Completed') {
                try { await updateStock(ItemName, UOMName, Quantity); } // Add to stock
                catch (errStock) { console.error("Stock update error:", errStock); }
            }

            res.json({ status: 1, message: "Line feed in created successfully", InID: result.insertId });
        });
    });
};


//-----------------------------------------------------------------------------------------------



// Get Current Stock
// exports.getCurrentStock = (req, res) => {
//     const query = `
//         SELECT * 
//         FROM current_stock
//         ORDER BY ItemName ASC
//     `;

//     db.mainDb(query, [], (err, result) => {
//         if (err) return res.json({ status: 0, message: "DB error", error: err });
//         res.json({ status: 1, data: result });
//     });
// };


// Update or insert stock
// function updateItemStock(ItemName, UOMName, qtyChange) {
//     return new Promise((resolve, reject) => {

//         const checkQuery = `
//             SELECT StockID, AvailableQty
//             FROM current_stock
//             WHERE ItemName = ? AND UOMName = ?
//         `;

//         db.mainDb(checkQuery, [ItemName, UOMName], (err, result) => {
//             if (err) return reject(err);

//             if (result.length > 0) {
//                 // Update existing stock
//                 const updateQuery = `
//                     UPDATE current_stock
//                     SET AvailableQty = AvailableQty + ?, LastUpdated = NOW()
//                     WHERE StockID = ?
//                 `;

//                 db.mainDb(updateQuery, [qtyChange, result[0].StockID], (err2) => {
//                     if (err2) return reject(err2);
//                     resolve();
//                 });

//             } else {
//                 // Insert new stock row
//                 const insertQuery = `
//                     INSERT INTO current_stock (ItemName, UOMName, AvailableQty, LastUpdated)
//                     VALUES (?, ?, ?, NOW())
//                 `;

//                 db.mainDb(insertQuery, [ItemName, UOMName, qtyChange], (err2) => {
//                     if (err2) return reject(err2);
//                     resolve();
//                 });
//             }
//         });
//     });
// }


// Inward Entry API
// exports.itemInward = async (req, res) => {
//     try {
//         const { ItemID, ItemName, UOMName, Quantity, Rate, Status } = req.body;

//         const insertQuery = `
//             INSERT INTO item_inward (ItemID, ItemName, UOMName, Quantity, Rate, Status)
//             VALUES (?, ?, ?, ?, ?, ?)
//         `;

//         db.mainDb(
//             insertQuery,
//             [ItemID, ItemName, UOMName, Quantity, Rate, Status],
//             async (err) => {
//                 if (err) {
//                     return res.json({ status: 0, message: "Insert error", error: err });
//                 }

//                 await updateItemStock(ItemID, UOMName, Quantity);

//                 res.json({
//                     status: 1,
//                     message: "Stock updated successfully"
//                 });
//             }
//         );

//     } catch (error) {
//         res.json({ status: 0, message: "Server error" });
//     }

//     };


//------------------------------------------------------------------------------



exports.getCurrentStock = (req, res) => {
    const query = `
        SELECT *
        FROM current_stock
        ORDER BY ItemName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error", error: err });
        res.json({ status: 1, data: result });
    });
};



// ================= STOCK UPDATE FUNCTION =================
// ADD YOUR FUNCTION HERE
function updateItemStock(ItemID, UOMName, qtyChange) {
    return new Promise((resolve, reject) => {

        const checkQuery = `
            SELECT StockID, AvailableQty
            FROM current_stock
            WHERE ItemID = ? AND UOMName = ?
        `;

        db.mainDb(checkQuery, [ItemID, UOMName], (err, result) => {
            if (err) return reject(err);

            if (result.length > 0) {

                const updateQuery = `
                    UPDATE current_stock
                    SET AvailableQty = AvailableQty + ?, LastUpdated = NOW()
                    WHERE StockID = ?
                `;

                db.mainDb(updateQuery, [qtyChange, result[0].StockID], (err2) => {
                    if (err2) return reject(err2);
                    resolve();
                });

            } else {

                const insertQuery = `
                    INSERT INTO current_stock (ItemID, UOMName, AvailableQty, LastUpdated)
                    VALUES (?, ?, ?, NOW())
                `;

                db.mainDb(insertQuery, [ItemID, UOMName, qtyChange], (err2) => {
                    if (err2) return reject(err2);
                    resolve();
                });
            }
        });
    });
}



// ================= INWARD API =================
exports.itemInward = async (req, res) => {
    try {
        const { ItemID, ItemName, UOMName, Quantity, Rate, Status } = req.body;

        const insertQuery = `
            INSERT INTO item_inward (ItemID, ItemName, UOMName, Quantity, Rate, Status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.mainDb(
            insertQuery,
            [ItemID, ItemName, UOMName, Quantity, Rate, Status],
            async (err) => {
                if (err) {
                    return res.json({ status: 0, message: "Insert error", error: err });
                }

                // IMPORTANT: This is where stock gets updated
                await updateItemStock(ItemID, UOMName, Quantity);

                res.json({
                    status: 1,
                    message: "Inward saved and stock updated successfully"
                });
            }
        );

    } catch (error) {
        res.json({ status: 0, message: "Server error" });
    }
};




// async function updateStock(ItemName, UOMName, qtyChange) {
//     return new Promise((resolve, reject) => {
//         db.mainDb(
//             `SELECT StockID, AvailableQty FROM current_stock WHERE ItemName=? AND UOMName=?`,
//             [ItemName, UOMName],
//             (err, result) => {
//                 if (err) return reject(err);

//                 if (result.length === 0) {
//                     // Create stock row if not exists
//                     db.mainDb(
//                         `INSERT INTO current_stock (ItemName, UOMName, AvailableQty) VALUES (?, ?, ?)`,
//                         [ItemName, UOMName, qtyChange],
//                         (err2) => {
//                             if (err2) return reject(err2);
//                             resolve();
//                         }
//                     );
//                 } else {
//                     // Update existing stock
//                     const newQty = result[0].AvailableQty + qtyChange;
//                     db.mainDb(
//                         `UPDATE current_stock SET AvailableQty=?, LastUpdated=NOW() WHERE StockID=?`,
//                         [newQty, result[0].StockID],
//                         (err2) => {
//                             if (err2) return reject(err2);
//                             resolve();
//                         }
//                     );
//                 }
//             }
//         );
//     });
// }======================================================


// Create Item Inward
exports.createItemInward = (req, res) => {
    const { ItemName, UOMName, Quantity, Rate, Status } = req.body;

    const v = new Validator(req.body, {
        ItemName: 'required|string|maxLength:150',
        UOMName: 'required|string|maxLength:50',
        Quantity: 'required|integer|min:1',
        Rate: 'required|decimal',
        Status: 'required|string|in:Pending,Completed'
    });

    v.check().then(async matched => {
        if (!matched) return res.json({ status: 0, message: Object.values(v.errors).map(e => e.message).join(", ") });

        const query = `INSERT INTO Item_Inward (ItemName, UOMName, Quantity, Rate, Status) VALUES (?, ?, ?, ?, ?)`;
        db.mainDb(query, [ItemName, UOMName, Quantity, Rate, Status], async (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            if (Status === 'Completed') {
                try { await updateStock(ItemName, UOMName, Quantity); }
                catch (errStock) { console.error("Stock update error:", errStock); }
            }

            res.json({ status: 1, message: "Item inward created successfully", InwardID: result.insertId });
        });
    });
};



//--------------------------------------------------------------------------



// Get active categories for dropdown
exports.getActiveCategories = (req, res) => {
    const query = `
        SELECT CategoryName
        FROM Category_Master
        ORDER BY CategoryName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only CategoryName array
        const categories = result.map(row => row.CategoryName);
        return res.json({ status: 1, data: categories });
    });
};



// Get active UOMs for dropdown
exports.getActiveUOMs = (req, res) => {
    const query = `
        SELECT UOMName
        FROM UOM_Master
        ORDER BY UOMName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of UOM names
        const uoms = result.map(row => row.UOMName);
        return res.json({ status: 1, data: uoms });
    });
};

//-------------------------------------------------------------------------------

// Get active workers for dropdown
exports.getActiveWorkers = (req, res) => {
    const query = `
       SELECT WorkerName
        FROM Worker_Master 
        where WorkerName IS NOT NULL
        ORDER BY WorkerName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of worker names
        const workers = result.map(row => row.WorkerName);
        return res.json({ status: 1, data: workers });
    });
};

//------------------------------------------------------------------------------



// Get customer for dropdown
exports.getdropCustomer = (req, res) => {
    const query = `
        SELECT DISTINCT Cus_Name
        FROM Customer_Master
        WHERE Cus_Name IS NOT NULL
        ORDER BY Cus_Name ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) {
            console.error("DB Error:", err);
            return res.json({
                status: 0,
                message: "Database error while fetching customers"
            });
        }

        const customers = result.map(row => row.Cus_Name);

        return res.json({
            status: 1,
            data: customers
        });
    });
};












//---------------------------------------------------------------------------
// Get active machines for dropdown
exports.getActiveMachines = (req, res) => {
    const query = `
        SELECT MachineName
        FROM machine_master
        ORDER BY MachineName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of machine names
        const machines = result.map(row => row.MachineName);
        return res.json({ status: 1, data: machines });
    });
};

// Get active items for dropdown
exports.getActiveItems = (req, res) => {
    const query = `
        SELECT ItemName
        FROM item_master
        ORDER BY ItemName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of item names
        const items = result.map(row => row.ItemName);
        return res.json({ status: 1, data: items });
    });
};



exports.getActiveItemcode = (req, res) => {
    const query = `
        SELECT ItemCode
        FROM item_master
        ORDER BY ItemCode ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of item codes
        const items = result.map(row => row.ItemCode);
        return res.json({ status: 1, data: items });
    });
};


















// Get tool active items for dropdown
exports.getActivetool = (req, res) => {
    const query = `
        SELECT ToolName
        FROM tool_master
        ORDER BY ToolName ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of tool names
        const items = result.map(row => row.ToolName); // ✅ corrected
        return res.json({ status: 1, data: items });
    });
};

//----------------------------------------------------------------------------------




exports.getActiveSalesProducts = (req, res) => {
    const query = `
        SELECT Product_Name
        FROM sales_product_master
        ORDER BY Product_Name ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of product names
        const products = result.map(row => row.Product_Name);
        return res.json({ status: 1, data: products });
    });
};



exports.getDashboardData = (req, res) => {
    const query = `
        SELECT
            (SELECT COUNT(*) FROM sales_product_master) AS total_products,
            (SELECT COUNT(*) FROM machine_master) AS total_machines,
            (SELECT COUNT(*) FROM Worker_Master) AS total_workers,
            (SELECT IFNULL(SUM(AvailableQty),0) FROM Current_Stock) AS total_stock_quantity
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // result[0] contains the aggregated data
        res.json({ status: 1, data: result[0] });
    });
};










//login
// exports.register = async (req, res) => {
//     const { UserName, Password } = req.body;

//     const v = new Validator(req.body, {
//         UserName: "required|string|max:100",
//         Password: "required|string|min:4"
//     });

//     if (v.fails()) {
//         return res.json({
//             status: 0,
//             message: Object.values(v.errors.all()).join(", ")
//         });
//     }

//     try {
//         const hash = await bcrypt.hash(Password, 10);

//         const query = `INSERT INTO Login (UserName, PasswordHash) VALUES (?, ?)`;

//         db.mainDb(query, [UserName, hash], (err) => {
//             if (err) {
//                 if (err.code === "ER_DUP_ENTRY") {
//                     return res.json({ status: 0, message: "User already exists" });
//                 }
//                 return res.json({ status: 0, message: "DB error" });
//             }

//             res.json({ status: 1, message: "User registered successfully" });
//         });

//     } catch (error) {
//         res.json({ status: 0, message: "Server error" });
//     }
// };

// /* ================= LOGIN ================= */
// exports.login = (req, res) => {
//     const { UserName, Password } = req.body;

//     if (!UserName || !Password) {
//         return res.json({ status: 0, message: "Username & Password required" });
//     }

//     const query = `SELECT * FROM Login WHERE UserName=?`;

//     db.mainDb(query, [UserName], async (err, result) => {
//         if (err) return res.json({ status: 0, message: "DB error" });

//         if (result.length === 0) {
//             return res.json({ status: 0, message: "Invalid Username" });
//         }

//         const user = result[0];

//         const isMatch = await bcrypt.compare(Password, user.PasswordHash);

//         if (!isMatch) {
//             return res.json({ status: 0, message: "Invalid Password" });
//         }

//         // Generate token
//         const token = jwt.sign(
//             { UserName: user.UserName },
//             SECRET_KEY,
//             { expiresIn: "1d" }
//         );

//         return res.json({
//             status: 1,
//             message: "Login successful",
//             token: token
//         });
//     });
// };







exports.createDeliveryChallanItem = (req, res) => {
    const { DeliveryChallanNo, customer_name, product_name, quantity, created_date } = req.body;

    if (!DeliveryChallanNo || !customer_name || !product_name || !quantity) {
        return res.json({ status: 0, message: "All fields are required" });
    }

    const query = `
        INSERT INTO delivery_challan
        (DeliveryChallanNo, customer_name, product_name, quantity, created_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.mainDb(
        query,
        [DeliveryChallanNo, customer_name, product_name, quantity, created_date],
        (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            res.json({ status: 1, message: "Item added successfully", id: result.insertId });
        }
    );
};
exports.getDeliveryChallans = (req, res) => {
    db.mainDb(
        `SELECT * FROM delivery_challan ORDER BY id DESC`,
        [],
        (err, result) => {
            if (err) {
                return res.json({ status: 0, message: "DB error" });
            }

            return res.json({
                status: 1,
                data: result
            });
        }
    );
};


exports.getDeliveryChallan = (req, res) => {
    const id = req.params.id;

    db.mainDb(
        `SELECT * FROM delivery_challan WHERE id=?`,
        [id],
        (err, result) => {
            if (err) {
                return res.json({ status: 0, message: "DB error" });
            }

            if (result.length === 0) {
                return res.json({ status: 0, message: "Record not found" });
            }

            return res.json({
                status: 1,
                data: result[0]
            });
        }
    );
};


exports.updateDeliveryChallan = (req, res) => {
    const reqData = req.body;

    const v = new Validator(reqData, {
        id: 'required|integer',
        DeliveryChallanNo: 'required|string|maxLength:50', // ✅ FIXED
        customer_name: 'required|string|maxLength:255',
        product_name: 'required|string|maxLength:255',
        quantity: 'required|integer|min:1',
        created_date: 'required|date'
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors)
                .map(e => e.message)
                .join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const updateQuery = `
            UPDATE delivery_challan
            SET DeliveryChallanNo=?, customer_name=?, product_name=?, quantity=?, created_date=?
            WHERE id=?
        `;

        db.mainDb(
            updateQuery,
            [
                reqData.DeliveryChallanNo, // ✅ FIXED
                reqData.customer_name,
                reqData.product_name,
                reqData.quantity,
                reqData.created_date,
                reqData.id
            ],
            (err, result) => {
                if (err) {
                    return res.json({ status: 0, message: "DB error" });
                }

                return res.json({
                    status: 1,
                    message: "Updated successfully"
                });
            }
        );
    });
};



exports.deleteDeliveryChallan = (req, res) => {
    const id = req.body.id;

    if (!id) {
        return res.json({ status: 0, message: "id is required" });
    }

    db.mainDb(
        `DELETE FROM delivery_challan WHERE id=?`,
        [id],
        (err, result) => {
            if (err) {
                return res.json({ status: 0, message: "DB error" });
            }

            if (result.affectedRows === 0) {
                return res.json({ status: 0, message: "Record not found" });
            }

            return res.json({
                status: 1,
                message: "Delivery Challan deleted successfully"
            });
        }
    );
};







// DELETE DELIVERY CHALLAN
exports.deleteChallan = (req, res) => {
  const { challan_no } = req.body;

  if (!challan_no) {
    return res.json({ status: 0, message: "Challan No required" });
  }

  const query = `
    DELETE FROM delivery_challan 
    WHERE DeliveryChallanNo = ?
  `;

  db.mainDb(query, [challan_no], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ status: 0, message: "Delete failed" });
    }

    if (result.affectedRows === 0) {
      return res.json({ status: 0, message: "Challan not found" });
    }

    return res.json({
      status: 1,
      message: "Challan deleted successfully"
    });
  });
};












exports.getChallanByNumber = (req, res) => {
    const { challanNo } = req.params;

    db.mainDb(
        `SELECT * FROM delivery_challan WHERE DeliveryChallanNo = ?`,
        [challanNo],
        (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            res.json({ status: 1, data: result });
        }
    );
};


exports.getDeliveryChallanHistory = (req, res) => {
    const query = `
        SELECT 
            DeliveryChallanNo,
            customer_name,
            created_date,
            COUNT(*) AS total_items,
            SUM(quantity) AS total_quantity
        FROM delivery_challan
        GROUP BY DeliveryChallanNo
        ORDER BY created_date DESC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        res.json({ status: 1, data: result });
    });
};

//----------------------------------------------------------------------------------



// Create Return Delivery Challan
exports.createReturnDeliveryChallan = (req, res) => {
    const reqData = req.body;

    const v = new Validator(reqData, {
        customer_name: "required|string|max:255",
        challan_date: "required|date"
    });

    v.check().then((matched) => {
        if (!matched) {
            const error_message = Object.values(v.errors)
                .map(e => e.message)
                .join(", ");
            return res.json({ status: 0, message: error_message });
        }

        const insertQuery = `
            INSERT INTO return_delivery_challan
            (customer_name, challan_date)
            VALUES (?, ?)
        `;

        db.mainDb(
            insertQuery,
            [reqData.customer_name, reqData.challan_date],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.json({ status: 0, message: "DB error" });
                }

                return res.json({
                    status: 1,
                    message: "Return Delivery Challan Created",
                    challan_id: result.insertId
                });
            }
        );
    });
};


// Get All Challans
exports.getReturnDeliveryChallans = (req, res) => {
    db.mainDb(
        `SELECT * FROM return_delivery_challan ORDER BY challan_id DESC`,
        [],
        (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });
            return res.json({ status: 1, data: result });
        }
    );
};



// Get Single Challan With Products
exports.getReturnDeliveryChallan = (req, res) => {
    const challan_id = req.body.challan_id;

    const query = `
        SELECT r.*, i.product_name, i.quantity
        FROM return_delivery_challan r
        LEFT JOIN return_delivery_challan_items i
        ON r.challan_id = i.challan_id
        WHERE r.challan_id = ?
    `;

    db.mainDb(query, [challan_id], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });
        return res.json({ status: 1, data: result });
    });
};

// Delete Challan
exports.deleteReturnDeliveryChallan = (req, res) => {
    const challan_id = req.body.challan_id;

    db.mainDb(
        `DELETE FROM return_delivery_challan WHERE challan_id=?`,
        [challan_id],
        (err, result) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            return res.json({
                status: 1,
                message: "Challan deleted successfully"
            });
        }
    );
};


//------------------------------------------------------------------------------

//tool inward
//Create Tool Inward & Update Stock
exports.createToolInward = (req, res) => {
    const { ToolName, UOMName, Quantity, Rate } = req.body;

    if (!ToolName || !UOMName || !Quantity || !Rate) {
        return res.json({ status: 0, message: "All fields are required" });
    }

    // 1️⃣ Insert into tool_inward
    const insertInward = `
        INSERT INTO tool_inward (ToolName, UOMName, Quantity, Rate)
        VALUES (?, ?, ?, ?)
    `;

    db.mainDb(insertInward, [ToolName, UOMName, Quantity, Rate], (err) => {
        if (err) return res.json({ status: 0, message: "DB error inserting inward" });

        // 2️⃣ Update stock in tool_current_stock
        updateToolStock(ToolName, UOMName, Quantity)
            .then(() => res.json({ status: 1, message: "Tool inward created & stock updated" }))
            .catch(errStock => {
                console.error("Stock update error:", errStock);
                res.json({ status: 0, message: "Stock update failed" });
            });
    });
};

// Get Tool Current Stock
exports.getToolCurrentStock = (req, res) => {
    const query = `SELECT * FROM tool_current_stock ORDER BY LastUpdated desc`;
    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error", error: err });
        res.json({ status: 1, data: result });
    });
};

// Update or insert stock
function updateToolStock(ToolName, UOMName, qtyChange) {
    return new Promise((resolve, reject) => {
        const checkQuery = `
            SELECT StockID, AvailableQty
            FROM tool_current_stock
            WHERE ToolName = ? AND UOMName = ?
        `;

        db.mainDb(checkQuery, [ToolName, UOMName], (err, result) => {
            if (err) return reject(err);

            if (result.length > 0) {
                // Update existing stock
                const updateQuery = `
                    UPDATE tool_current_stock
                    SET AvailableQty = AvailableQty + ?, LastUpdated = NOW()
                    WHERE StockID = ?
                `;
                db.mainDb(updateQuery, [qtyChange, result[0].StockID], err2 =>
                    err2 ? reject(err2) : resolve()
                );
            } else {
                // Insert new stock row
                const insertQuery = `
                    INSERT INTO tool_current_stock (ToolName, UOMName, AvailableQty)
                    VALUES (?, ?, ?)
                `;
                db.mainDb(insertQuery, [ToolName, UOMName, qtyChange], err2 =>
                    err2 ? reject(err2) : resolve()
                );
            }
        });
    });
}


//--------------------------------------------------------------------------


/* ================= HELPER FUNCTIONS ================= */
function reduceProductStock(name, uom, qty) {
    return new Promise((resolve, reject) => {
        db.mainDb(`SELECT AvailableQty, StockID FROM current_stock WHERE ItemName=? AND UOMName=?`, [name, uom], (err, rows) => {
            if (err) return reject(err);
            if (!rows.length) return reject("Product not in stock");

            const newQty = rows[0].AvailableQty - qty;
            if (newQty < 0) return reject("Insufficient product stock");

            db.mainDb(`UPDATE current_stock SET AvailableQty=?, LastUpdated=NOW() WHERE StockID=?`, [newQty, rows[0].StockID], err2 => err2 ? reject(err2) : resolve());
        });
    });
}

function reduceToolStock(name, qty) {
    return new Promise((resolve, reject) => {
        db.mainDb(`SELECT AvailableQty, StockID FROM tool_current_stock WHERE ToolName=?`, [name], (err, rows) => {
            if (err) return reject(err);
            if (!rows.length) return reject("Tool not in stock");

            const newQty = rows[0].AvailableQty - qty;
            if (newQty < 0) return reject("Insufficient tool stock");

            db.mainDb(`UPDATE tool_current_stock SET AvailableQty=?, LastUpdated=NOW() WHERE StockID=?`, [newQty, rows[0].StockID], err2 => err2 ? reject(err2) : resolve());
        });
    });
}







exports.getItemCodes = (req, res) => {
    const query = `
        SELECT ItemCode
        FROM item_master
        ORDER BY ItemCode ASC
    `;

    db.mainDb(query, [], (err, result) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        // Return only array of item codes
        const items = result.map(row => row.ItemCode);
        return res.json({ status: 1, data: items });
    });
};









exports.addSale = (req, res) => {

    try {

        const data = req.body;

        /* Calculate if frontend didn't send */
        const subTotal = data.Sub_Total || data.Quantity * data.Price;
        const gstTotal =
            data.GST_Total ||
            subTotal * ((Number(data.SGST) + Number(data.CGST)) / 100);
        const totalAmount = data.Total_Amount || subTotal + gstTotal;

        /* Check invoice exists */
        const checkInvoice = "SELECT * FROM sales_invoice WHERE Invoice_No=?";

        db.mainDb(checkInvoice, [data.Invoice_No], (err, invoiceRows) => {
            if (err) {
                console.log(err);
                return res.json({ status: 0, message: "Database error" });
            }

            /* Insert Item (sales_master) */
            const insertItemQuery = `
      INSERT INTO sales_master
      (Invoice_No, Invoice_Date, Customer_Name, Product_Name, Quantity, Price,
       SGST, CGST, Sub_Total, GST_Total, Total_Amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

            const insertItem = () => {
                db.mainDb(
                    insertItemQuery,
                    [
                        data.Invoice_No,
                        data.Invoice_Date,
                        data.Customer_Name,
                        data.Product_Name,
                        data.Quantity,
                        data.Price,
                        data.SGST,
                        data.CGST,
                        subTotal,
                        gstTotal,
                        totalAmount,
                    ],
                    (err) => {
                        if (err) {
                            console.log(err);
                            return res.json({ status: 0, message: "Item insert failed" });
                        }

                        return res.json({
                            status: 1,
                            message: "Item stored successfully",
                        });
                    }
                );
            };

            /* If first item create invoice */
            if (invoiceRows.length === 0) {
                const insertInvoiceQuery = `
        INSERT INTO sales_invoice
        (Invoice_No, Invoice_Date, Customer_Name, Customer_Address,
         Customer_Phone, Customer_GSTIN, Subtotal, GST_Total, Total_Amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

                db.mainDb(
                    insertInvoiceQuery,
                    [
                        data.Invoice_No,
                        data.Invoice_Date,
                        data.Customer_Name,
                        data.Customer_Address,
                        data.Customer_Phone,
                        data.Customer_GSTIN,
                        subTotal,
                        gstTotal,
                        totalAmount,
                    ],
                    (err) => {
                        if (err) {
                            console.log(err);
                            return res.json({ status: 0, message: "Invoice insert failed" });
                        }

                        insertItem();
                    }
                );
            } else {
                /* Update totals if more items added */
                const updateInvoice = `
        UPDATE sales_invoice
        SET Subtotal = Subtotal + ?, GST_Total = GST_Total + ?, Total_Amount = Total_Amount + ?
        WHERE Invoice_No = ?
      `;

                db.mainDb(
                    updateInvoice,
                    [subTotal, gstTotal, totalAmount, data.Invoice_No],
                    (err) => {
                        if (err) {
                            console.log(err);
                            return res.json({ status: 0, message: "Invoice update failed" });
                        }

                        insertItem();
                    }
                );
            }
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getInvoices = (req, res) => {
    db.mainDb(
        "SELECT * FROM sales_invoice ORDER BY Invoice_Date DESC",
        (err, result) => {
            if (err) return res.json({ status: 0 });

            res.json({
                status: 1,
                data: result,
            });
        }
    );
};

exports.getInvoice = (req, res) => {
    const invoiceNo = req.params.invoiceNo;

    db.mainDb(
        "SELECT * FROM sales_invoice WHERE Invoice_No=?",
        [invoiceNo],
        (err, invoice) => {
            if (err) return res.json({ status: 0 });

            db.mainDb(
                "SELECT * FROM sales_master WHERE Invoice_No=?",
                [invoiceNo],
                (err, items) => {
                    if (err) return res.json({ status: 0 });

                    res.json({
                        status: 1,
                        invoice: invoice[0],
                        items,
                    });
                }
            );
        }
    );
};

exports.getSales = (req, res) => {
    db.mainDb("SELECT * FROM sales_master", (err, result) => {
        if (err) return res.json({ status: 0 });

        res.json({
            status: 1,
            data: result,
        });
    });
};



exports.getNextInvoice = (req, res) => {
    const query = `
    SELECT Invoice_No 
    FROM sales_invoice 
    ORDER BY Sale_ID DESC 
    LIMIT 1
  `;

    db.mainDb(query, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ status: 0 });
        }

        let nextNumber = 1;

        if (result.length > 0) {
            const lastInvoice = result[0].Invoice_No;

            const numberPart = lastInvoice.replace("INV-SAT", "");
            nextNumber = parseInt(numberPart) + 1;
        }

        const newInvoice =
            "INV-SAT" + String(nextNumber).padStart(4, "0");

        res.json({
            status: 1,
            invoiceNo: newInvoice,
        });
    });
};



exports.getInvoiceDetails = (req, res) => {
    const invoiceNo = req.params.invoiceNo;

    const invoiceQuery = `SELECT * FROM sales_invoice WHERE Invoice_No=?`;
    const itemsQuery = `SELECT * FROM sales_master WHERE Invoice_No=?`;

    db.mainDb(invoiceQuery, [invoiceNo], (err, invoice) => {
        if (err) return res.json({ status: 0, message: "DB error" });

        db.mainDb(itemsQuery, [invoiceNo], (err, items) => {
            if (err) return res.json({ status: 0, message: "DB error" });

            return res.json({
                status: 1,
                invoice: invoice[0],
                items: items
            });
        });
    });
};

// DELETE INVOICE BY INVOICE NO
exports.deleteInvoice = (req, res) => {
  const { invoice_no } = req.body;

  if (!invoice_no) {
    return res.json({ status: 0, message: "Invoice No required" });
  }

  const query = `DELETE FROM sales_invoice WHERE Invoice_No = ?`;

  db.mainDb(query, [invoice_no], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ status: 0, message: "Delete failed" });
    }

    if (result.affectedRows === 0) {
      return res.json({ status: 0, message: "Invoice not found" });
    }

    return res.json({
      status: 1,
      message: "Invoice deleted successfully"
    });
  });
};














exports.createWorkOrder = (req, res) => {
  const {
    work_date,
    machine_name,
    worker_name,
    tool_name,
    category_name,
    tool_qty,
  } = req.body;

  if (
    !work_date ||
    !machine_name ||
    !worker_name ||
    !tool_name ||
    !category_name ||
    tool_qty === "" || tool_qty === null
  ) {
    return res.json({ status: 0, message: "All fields are required" });
  }

  const qty = Number(tool_qty);

  // 🔹 Step 1: Check Stock
  const checkStockQuery = `
    SELECT AvailableQty 
    FROM tool_current_stock 
    WHERE ToolName = ?
  `;

  db.mainDb(checkStockQuery, [tool_name], (err, stockResult) => {
    if (err) {
      console.log("STOCK CHECK ERROR:", err);
      return res.json({ status: 0, message: err.sqlMessage });
    }

    if (stockResult.length === 0) {
      return res.json({ status: 0, message: "Tool not found in stock" });
    }

    const availableQty = stockResult[0].AvailableQty;

    // ❌ Not enough stock
    if (availableQty < qty) {
      return res.json({
        status: 0,
        message: `Only ${availableQty} available in stock`,
      });
    }

    // 🔹 Step 2: Insert WorkOrder
    const insertQuery = `
      INSERT INTO workorder
      (work_date, machine_name, worker_name, tool_name, category_name, tool_qty)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.mainDb(
      insertQuery,
      [work_date, machine_name, worker_name, tool_name, category_name, qty],
      (err) => {
        if (err) {
          console.log("INSERT ERROR:", err);
          return res.json({ status: 0, message: err.sqlMessage });
        }

        // 🔹 Step 3: Reduce Stock
        const updateStockQuery = `
          UPDATE tool_current_stock
          SET AvailableQty = AvailableQty - ?
          WHERE ToolName = ?
        `;

        db.mainDb(updateStockQuery, [qty, tool_name], (err) => {
          if (err) {
            console.log("STOCK UPDATE ERROR:", err);
            return res.json({ status: 0, message: err.sqlMessage });
          }

          res.json({
            status: 1,
            message: "Saved & Stock Updated Successfully",
          });
        });
      }
    );
  });
};


// ================= GET LIST =================
exports.getList = (req, res) => {
  const query = "SELECT * FROM workorder ORDER BY work_date desc";

  db.mainDb(query, (err, result) => {
    if (err) {
      console.log("FETCH ERROR:", err);
      return res.json({ status: 0 });
    }

    res.json({ status: 1, data: result });
  });
};


// ================= UPDATE =================
exports.updateWorkOrder = (req, res) => {
  const {
    id,
    work_date,
    machine_name,
    worker_name,
    tool_name,
    category_name,
    tool_qty,
  } = req.body;

  if (!id) {
    return res.json({ status: 0, message: "ID is required" });
  }

  const query = `
    UPDATE workorder
    SET work_date=?, machine_name=?, worker_name=?, tool_name=?, category_name=?, tool_qty=?
    WHERE id=?
  `;

  db.mainDb(
    query,
    [work_date, machine_name, worker_name, tool_name, category_name, Number(tool_qty), id],
    (err, result) => {
      if (err) {
        console.log("UPDATE ERROR:", err);
        return res.json({ status: 0, message: err.sqlMessage });
      }

      res.json({ status: 1, message: "Updated Successfully" });
    }
  );
};


// ================= DELETE =================
exports.deleteWorkOrder = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({ status: 0, message: "ID is required" });
  }

  const query = "DELETE FROM workorder WHERE id=?";

  db.mainDb(query, [id], (err, result) => {
    if (err) {
      console.log("DELETE ERROR:", err);
      return res.json({ status: 0, message: err.sqlMessage });
    }

    res.json({ status: 1, message: "Deleted Successfully" });
  });
};


exports.getWorkOrderHistory = (req, res) => {
  const { from_date, to_date, worker_name } = req.query;

  let query = `SELECT * FROM workorder WHERE 1=1`;
  let params = [];

  if (from_date && to_date) {
    query += " AND work_date BETWEEN ? AND ?";
    params.push(from_date, to_date);
  }

  if (worker_name) {
    query += " AND worker_name = ?";
    params.push(worker_name);
  }

  query += " ORDER BY work_date desc";

  db.mainDb(query, params, (err, result) => {
    if (err) {
      console.log("HISTORY ERROR:", err);
      return res.json({ status: 0 });
    }

    res.json({ status: 1, data: result });
  });
};

//----------------------------------------------------------------------------------

// LOGIN
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.mainDb(
    "SELECT * FROM admin_users WHERE username=?",
    [username],
    (err, result) => {
      if (err) return res.json({ status: 0, message: "DB error" });

      if (result.length === 0) {
        return res.json({ status: 0, message: "Invalid username" });
      }

      if (result[0].password !== password) {
        return res.json({ status: 0, message: "Invalid password" });
      }

      return res.json({ status: 1, message: "Login successful" });
    }
  );
};

// CHANGE PASSWORD
exports.changePassword = (req, res) => {
  const { username, old_password, new_password } = req.body;

  if (!username || !old_password || !new_password) {
    return res.json({ status: 0, message: "All fields required" });
  }

  db.mainDb(
    "SELECT * FROM admin_users WHERE username=?",
    [username],
    (err, result) => {
      if (err) return res.json({ status: 0, message: "DB error" });

      if (result.length === 0) {
        return res.json({ status: 0, message: "User not found" });
      }

      if (result[0].password !== old_password) {
        return res.json({ status: 0, message: "Old password incorrect" });
      }

      db.mainDb(
        "UPDATE admin_users SET password=? WHERE username=?",
        [new_password, username],
        (err) => {
          if (err) return res.json({ status: 0, message: "Update failed" });

          return res.json({
            status: 1,
            message: "Password updated successfully"
          });
        }
      );
    }
  );
};