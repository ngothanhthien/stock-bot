import db from '../configs/db.js'
import { DataTypes, Op } from 'sequelize'
import { lastTimeOfNDay } from '../helpers/time.js'
import { DEBUG } from '../configs/general.js'

//date field format: 2022-11-14T17:00Z
const StockModel = db.define(
  'stocks',
  {
    code: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    buy_price: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    root_price: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    last_price: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    expire_last: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    min_3m: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    max_3m: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    expire_3m: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    date_max_3m: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date_min_3m: {
      type: DataTypes.STRING,
      allowNull: true
    },
    min_1Y: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    max_1Y: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    date_max_1Y: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date_min_1Y: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expire_1Y: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    min_3Y: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    max_3Y: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    date_max_3Y: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date_min_3Y: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expire_3Y: {
      type: DataTypes.NUMBER,
      allowNull: true
    }
  },
  {
    timestamps: false
  }
)

const StockSellHistory = db.define('stock_sell_history', {
  code: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  buy_price: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  price: {
    type: DataTypes.NUMBER,
    allowNull: false
  }
})
await db.sync()

class Stock {
  constructor(code) {
    this.code = code
    this.pending = {
      code
    }
  }

  /**
   *
   * @param {string} code
   * @param {number} root
   * @param {number} next
   * @returns {void}
   */
  setDirection(code, root, next) {
    this.pending = {
      ...this.pending,
      root_price: root,
      last_price: next,
      expire_last: lastTimeOfNDay(0) // 0 is today
    }
  }

  /**
   *
   * @param {string} code
   * @param {number} min
   * @param {number} max
   * @param {string} dateMin
   * @param {string} dateMax
   * @param {ChartType} type
   */
  setPriceRecord(code, min, max, dateMin, dateMax, type) {
    switch (type) {
      case '3M':
        this.pending = {
          ...this.pending,
          min_3m: min,
          max_3m: max,
          date_min_3m: dateMin,
          date_max_3m: dateMax,
          expire_3m: lastTimeOfNDay(30)
        }
        break
      case '1Y':
        this.pending = {
          ...this.pending,
          min_1Y: min,
          max_1Y: max,
          date_min_1Y: dateMin,
          date_max_1Y: dateMax,
          expire_1Y: lastTimeOfNDay(90)
        }
        break
      case '3Y':
        this.pending = {
          ...this.pending,
          min_3Y: min,
          max_3Y: max,
          date_min_3Y: dateMin,
          date_max_3Y: dateMax,
          expire_3Y: lastTimeOfNDay(365)
        }
    }
  }

  setTitle(name) {
    this.pending = {
      ...this.pending,
      name
    }
  }

  /**
   *
   * @param {number} quantity
   * @param {number} buyPrice
   */
  setOwn(quantity, buyPrice) {
    this.pending = {
      ...this.pending,
      quantity,
      buy_price: buyPrice
    }
  }

  /**
   *
   * @param {number} quantity
   * @param {number} price
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async sell(quantity, price) {
    const stock = await this.getStock()
    if (!stock) {
      throw new Error('Stock not found')
    }
    if (!stock.quantity || stock.quantity < quantity) {
      throw new Error('Not enough quantity')
    }
    const newQuantity = stock.quantity - quantity
    if (newQuantity === 0) {
      stock.quantity = null
      stock.buy_price = null
    } else {
      stock.quantity = newQuantity
    }
    const t = await db.transaction()
    try {
      await stock.save()
      await StockSellHistory.create({
        code: this.code,
        quantity,
        buy_price: stock.buy_price,
        price
      })
      await t.commit()
    } catch {
      await t.rollback()
      throw new Error('Database error')
    }
  }
  /**
   *
   * @returns {Promise<StockModel>}
   */
  async getStock() {
    return await StockModel.findByPk(this.code)
  }

  /**
   *
   * @returns {Promise<any>}
   */
  async save() {
    if (DEBUG) {
      console.log('save', this.pending)
    }
    await StockModel.upsert(this.pending)
    return this.pending
  }
}

/**
 *
 * @param {string[]} codes
 * @returns {Promise<StockModel[]>}
 */
async function getStocks(codes) {
  if (DEBUG) {
    console.log('getStocks', codes)
  }
  const records = await StockModel.findAll({
    where: {
      code: codes
    }
  })

  const output = {}
  records.forEach((record) => {
    output[record.code] = record.dataValues
  })

  codes.forEach((code) => {
    if (!output[code]) {
      output[code] = null
    }
  })

  return output
}

async function getOwnStocks() {
  return await StockModel.findAll({
    where: {
      quantity: {
        [Op.not]: null
      }
    }
  })
}

export { Stock, getStocks, getOwnStocks }
