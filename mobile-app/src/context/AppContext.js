import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tableCode, setTableCode] = useState("T01");
  const [tableName, setTableName] = useState("Bàn 01");
  const [customerName, setCustomerName] = useState("Khách tại bàn");
  const [customerPhone, setCustomerPhone] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Them mon vao gio hang
  const addToCart = (item, selectedOption = "") => {
    setCartItems((prev) => {
      const optionLabel = selectedOption || (item.options && item.options[0] ? item.options[0].label : "");
      const priceDelta = item.options ? (item.options.find((o) => o.label === optionLabel)?.priceDelta || 0) : 0;
      const unitPrice = item.price + priceDelta;

      const existingIndex = prev.findIndex(
        (ci) => ci._id === item._id && ci.selectedOption === optionLabel
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }

      return [
        ...prev,
        {
          _id: item._id,
          name: item.name,
          category: item.category,
          basePrice: item.price,
          price: unitPrice,
          selectedOption: optionLabel,
          quantity: 1,
          imageUrl: item.imageUrl || ""
        }
      ];
    });
  };

  // Thay doi so luong
  const updateQuantity = (index, delta) => {
    setCartItems((prev) => {
      const next = [...prev];
      const target = next[index];
      if (!target) return prev;
      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      target.quantity = nextQty;
      return next;
    });
  };

  // Xoa mon khoi gio
  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Don sach gio hang
  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        tableCode,
        setTableCode,
        tableName,
        setTableName,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotalAmount,
        activeOrder,
        setActiveOrder,
        orderHistory,
        setOrderHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
