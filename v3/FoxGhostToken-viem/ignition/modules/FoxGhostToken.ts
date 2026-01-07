import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FoxGhostTokenModule", (m) => {
  const owner = m.getAccount(0);
  const counter = m.contract("FoxGhostToken", [owner]);

  return { counter };
});
