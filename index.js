const API = (() => {
  const URL = "http://localhost:3000";

  const getCart = () => {
    // define your method to get cart data
    return fetch(URL + "/cart").then((data) => data.json());
  };

  // define your method to get inventory data

  const getInventory = () =>
    fetch(URL + "/inventory").then((data) => data.json());

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(URL + "/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inventoryItem),
    }).then((res) => res.json());
  };

  const updateInventory = (id, data) => {
    return fetch(URL + "/inventory/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const updateCart = (id, data) => {
    // define your method to update an item in cart
    return fetch(URL + "/cart" + `/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    return fetch(URL + "/cart" + `/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange?.();
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange?.();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const inventoryListEl = document.querySelector(".inventory-container ul");
  const inventoryItem = document.querySelector(".li");
  const cartListEl = document.querySelector(".cart-wrapper ul");
  const checkoutBtn = document.querySelector(".checkout-btn");

  const renderInventory = (inventory) => {
    let inventoryTemp = "";
    inventory.forEach((item) => {
      const liTemp = `
          <li class="li" id="${item.id}">
          <span>${item.content}</span>
          <button id="decrease" class="decrease-btn" data-id="${item.id}">-</button>
          <span id="amount" class="amount">${item.amount}</span>
          <button id="increase"class="increase-btn" data-id="${item.id}">+</button>
          <button class="add-cart-btn"  data-id="${item.id}">add to cart</button>
          </li>
          `;
      inventoryTemp += liTemp;
    });

    inventoryListEl.innerHTML = inventoryTemp;
  };

  const renderCart = (cart) => {
    let temp = "";
    cart.forEach((item) => {
      const liTemp = `
          <li class="li" id="${item.id}">
          <span>${item.content}</span>
          <span id="amount" class="amount">quantity: ${item.amount}</span>
          <button class="delete-cart-btn" data-id="${item.id}">Delete</button>
          </li>
          `;
      temp += liTemp;
    });

    cartListEl.innerHTML = temp;
  };

  return {
    inventoryListEl,
    cartListEl,
    renderInventory,
    renderCart,
    inventoryItem,
    checkoutBtn,
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {
    model.getInventory().then((data) => {
      state.inventory = data;
    });
    model.getCart().then((data) => {
      state.cart = data;
    });
    view.cartListEl.addEventListener("click", (e) => {
      let id = parseInt(e.target.dataset.id);
      if (e.target.className === "delete-cart-btn") {
        handleDelete(id);
      }
    });
    view.checkoutBtn.addEventListener("click", () => {
      handleCheckout();
    });
  };

  const handleUpdateAmount = () => {
    view.inventoryListEl.addEventListener("click", (event) => {
      let amountEl = document.getElementById("amount");
      let quantity = parseInt(amountEl.innerText);

      let id = parseInt(event.target.dataset.id);
      let tempInventory = [...state.inventory];
      objIndex = state.inventory.findIndex((obj) => obj.id == id);
      const newData = state.inventory.find((item) => item.id === id);

      if (event.target.className === "decrease-btn") {
        if (quantity > 1) {
          newData.amount--;
          tempInventory[objIndex] = newData;
          state.inventory = tempInventory;
          console.log(newData);
          API.updateInventory(id, newData);
        }
      } else if (event.target.className === "increase-btn") {
        newData.amount++;
        tempInventory[objIndex] = newData;
        state.inventory = tempInventory;
        console.log(newData);
        API.updateInventory(id, newData);
      } else if (event.target.className === "add-cart-btn") {
        let alreadyExist;
        alreadyExist = !!state.cart.find((item) => item.id === id);
        if (!alreadyExist) API.addToCart(newData);
        else {
          let newItem = state.cart.find((item) => item.id === id);
          newItem.amount += newData.amount;

          let tempCart = [...state.cart];
          let index = state.cart.findIndex((obj) => obj.id == id);
          tempCart[index] = newItem;
          state.cart = tempCart;
          API.updateCart(id, newItem);
        }
      }
    });
  };

  const handleDelete = (id) => {
    API.deleteFromCart(id);
  };

  const handleCheckout = () => {
    console.log("cleared");
    state.cart = [];
    API.checkout();
  };
  const bootstrap = () => {
    init();
    state.subscribe(() => {
      view.renderInventory(state.inventory);
      view.renderCart(state.cart);
    });
    handleUpdateAmount();
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
