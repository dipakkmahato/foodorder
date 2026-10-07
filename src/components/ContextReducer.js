import React, { createContext, useContext, useReducer } from "react";

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: action.id,
          name: action.name,
          qty: action.qty,
          size: action.size,
          price: action.price,
          img: action.img,
        },
      ];
      case "REMOVE":
        let newArr = [...state]
        newArr.splice(action.index, 1)
        return newArr;

      case "UPDATE":
        let arr = [...state];
        const updateIndex = arr.findIndex(
          (food) => food.id === action.id && food.size === action.size
        );
        if (updateIndex !== -1) {
          arr[updateIndex] = {
            ...arr[updateIndex],
            qty: parseInt(action.qty) + arr[updateIndex].qty,
            price: action.price + arr[updateIndex].price,
          };
        }
        return arr;
        case "DROP":
          let emptyArray =[]
          return emptyArray
    default:
      console.log("Error in Reducer");
      return state; // Return the current state if no action matches
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, []);

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
};

export const useCart = () => useContext(CartStateContext);
export const useDispatchCart = () => useContext(CartDispatchContext);
