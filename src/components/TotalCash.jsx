import React, { useContext } from "react";

import CashContext from "../contexts/CashContext";

const TotalCash = () => {
  const [cash] = useContext(CashContext);
  return (
    <>
      <h1>Available: ${cash.current}</h1>
      <h3>Total earned: ${cash.total}</h3>
    </>
  );
};

export default TotalCash;
