const { Contract } = require("fabric-contract-api");

class loyaltyContract extends Contract {
  async registerCustomer(ctx, customerId, storeId, initialPoints) {
    const exists = await this.customerExists(ctx, customerId);
    if (exists) {
      throw new Error(`The customer ${customerId} already exists`);
    }

    const customer = {
      docType: "customer",
      storeId: storeId,
      points: parseInt(initialPoints),
      active: true,
    };

    await ctx.stub.putState(customerId, Buffer.from(JSON.stringify(customer)));
  }

  async registerStore(ctx, storeId) {
    const exists = await this.storeExists(ctx, storeId);
    if (exists) {
      throw new Error(`The store ${storeId} already exists`);
    }

    const store = {
      docType: "store", //Tipo de documento
    };

    await ctx.stub.putState(storeId, Buffer.from(JSON.stringify(store)));
  }

  async earnPoints(ctx, customerId, points) {
    const customer = await this._getCustomer(ctx, customerId);

    if (!customer.active) {
      throw new Error(`The customer ${customerId} is not active`);
    }

    customer.points += parseInt(points); //Suma los puntos
    await ctx.stub.putState(customerId, Buffer.from(JSON.stringify(customer)));
  }

  async spendPoints(ctx, customerId, points) {
    const customer = await this._getCustomer(ctx, customerId);

    const pointsToSpend = parseInt(points); //Puntos a canjear
    if (pointsToSpend > customer.points) {
      throw new Error(`The customer ${customerId} does not have enough points`);
    }

    customer.points -= pointsToSpend;
    await ctx.stub.putState(customerId, Buffer.from(JSON.stringify(customer)));
  }

  async checkPoints(ctx, customerId) {
    const customer = await this._getCustomer(ctx, customerId);

    return customer.points; //Retorna los puntos
  }

  async desactiveCustomer(ctx, customerId) {
    const customer = await this._getCustomer(ctx, customerId);

    customer.active = false; //desactiva el cliente
    await ctx.stub.putState(customerId, Buffer.from(JSON.stringify(customer)));
  }

  async activeCustomer(ctx, customerId) {
    const customer = await this._getCustomer(ctx, customerId);

    customer.active = true;
    await ctx.stub.putState(customerId, Buffer.from(JSON.stringify(customer)));
  }

  async _getCustomer(ctx, customerId) {
    const customerJSON = await ctx.stub.getState(customerId);
    if (!customerJSON || customerJSON.length === 0) {
      throw new Error(`The customer ${customerId} does not exist`);
    }

    return JSON.parse(customerJSON.toString());
  }

  async customerExists(ctx, customerId) {
    const customerJSON = await ctx.stub.getState(customerId);
    return customerJSON && customerJSON.length > 0;
  }

  async storeExists(ctx, storeId) {
    const storeJSON = await ctx.stub.getState(storeId);
    return storeJSON && storeJSON.length > 0;
  }
}

module.exports = loyaltyContract;
