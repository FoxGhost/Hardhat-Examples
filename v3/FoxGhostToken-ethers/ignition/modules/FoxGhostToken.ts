import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FoxGhostTokenModule", (m) => {
  const owner = m.getAccount(0);
  const Token = m.contract("FoxGhostToken", [owner]);

  return { Token };
});
