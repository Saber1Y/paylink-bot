import { parseAbi } from "viem";

export const payAbi = parseAbi([
  "struct Request { uint256 id; address creator; address recipient; address token; uint256 amount; uint8 status; string description; uint256 createdAt; uint256 paidAt; address payer; }",
  "function nextId() view returns (uint256)",
  "function requestCount() view returns (uint256)",
  "function createRequest(address recipient, address token, uint256 amount, string description) returns (uint256 id)",
  "function pay(uint256 id) payable",
  "function cancel(uint256 id)",
  "function getRequest(uint256 id) view returns (Request)",
  "function getRequests(uint256 offset, uint256 limit) view returns (Request[])",
  "function idsByCreator(address creator) view returns (uint256[])",
  "event RequestCreated(uint256 indexed id, address indexed creator, address indexed recipient, address token, uint256 amount, string description)",
  "event RequestPaid(uint256 indexed id, address indexed payer, address indexed recipient, address token, uint256 amount, uint256 paidAt)",
  "event RequestCancelled(uint256 indexed id, address indexed creator)",
]);

export const erc20Abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);