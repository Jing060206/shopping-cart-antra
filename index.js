const API = (() => {
  const URL = "http://localhost:3000";

  const getCart = () => {
    // define your method to get cart data
    fetch(URL + "/cart").then((data) => data.json());
  };

  // define your method to get inventory data

  const getInventory = () =>
    fetch(URL + "/inventory").then((data) => data.json());

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inventoryItem),
    }).then((res) => res.json());
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
    return fetch(URL + `/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateTodo),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    return fetch(URL + `/${id}`, {
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
  const cartListEl = document.querySelector(".cart-wrapper ul");
  const decreaseBtn = document.getElementById("increase");

  const renderInventory = (inventory) => {
    let inventoryTemp = "";
    inventory.forEach((item) => {
      const liTemp = `
          <li id="${item.id}">
          <span>${item.content}</span>
          <button class="decrease-btn">-</button>
          <span id="amount" class="amount">9</span>
          <button id="increase"class="increase-btn">+</button>
          <button class="add-cart-btn">add to cart</button>
          </li>
          `;
      inventoryTemp += liTemp;
    });

    inventoryListEl.innerHTML = inventoryTemp;
  };

  return {
    inventoryListEl,
    cartListEl,
    decreaseBtn,
    renderInventory,
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {
    model.getInventory().then((data) => {
      state.inventory = data;
    });
  };
  const handleUpdateAmount = (event) => {
    view.inventoryListEl.addEventListener("click", (event) => {
      let amountEl = document.getElementById("amount");
      let quantity = parseInt(amountEl.innerText);

      if (event.target.className !== "decrease-btn") return;

      if (event.target.className === "decrease-btn") {
        if (quantity > 0) {
          quantity--;
          amountEl.innerText = quantity;
        }
      }

      if (event.target.className !== "increase-btn") return;
      if (event.target.className === "increase-btn") {
        quantity++;
        amountEl.innerText = quantity;
      }
    });
  };

  const handleAddToCart = () => {};

  const handleDelete = () => {};

  const handleCheckout = () => {};
  const bootstrap = () => {
    init();
    state.subscribe(() => {
      view.renderInventory(state.inventory);
    });
    handleUpdateAmount();

    handleCheckout();
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
