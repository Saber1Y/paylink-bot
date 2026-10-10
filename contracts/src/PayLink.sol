// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  PayLink
/// @notice Payment requests on BOT Chain.
///         A user creates a payment request with an amount, description and
///         recipient wallet, shares the id (the "/pay/<id>" link), and a payer
///         settles it. The full request history is readable on-chain through
///         view functions, so no indexer or subgraph is required.
/// @dev    Settlement is pull-free: the payer moves funds directly to the
///         recipient. Supported assets are native BOT (token == address(0))
///         and any standard ERC-20 such as USDT.
contract PayLink {
    enum Status {
        Pending,
        Paid,
        Cancelled
    }

    struct Request {
        uint256 id;
        address creator;
        address recipient;
        address token; // address(0) => native BOT
        uint256 amount;
        Status status;
        string description;
        uint256 createdAt;
        uint256 paidAt;
        address payer;
    }

    /// @notice Next id that will be assigned. Ids start at 1; id 0 means "missing".
    uint256 public nextId = 1;

    mapping(uint256 => Request) private _requests;
    uint256[] private _allIds;

    event RequestCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed recipient,
        address token,
        uint256 amount,
        string description
    );

    event RequestPaid(
        uint256 indexed id,
        address indexed payer,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 paidAt
    );

    event RequestCancelled(uint256 indexed id, address indexed creator);

    error NotFound();
    error NotPending();
    error NotCreator();
    error ZeroRecipient();
    error ZeroAmount();
    error WrongAmount(uint256 expected, uint256 sent);
    error NativeNotAllowed();
    error TransferFailed();

    /// @notice Create a payment request.
    /// @param recipient   Wallet that receives the funds.
    /// @param token       ERC-20 address, or address(0) for native BOT.
    /// @param amount      Amount in the token's smallest unit.
    /// @param description Short note shown to the payer.
    function createRequest(
        address recipient,
        address token,
        uint256 amount,
        string calldata description
    ) external returns (uint256 id) {
        if (recipient == address(0)) revert ZeroRecipient();
        if (amount == 0) revert ZeroAmount();

        id = nextId++;
        Request storage r = _requests[id];
        r.id = id;
        r.creator = msg.sender;
        r.recipient = recipient;
        r.token = token;
        r.amount = amount;
        r.status = Status.Pending;
        r.description = description;
        r.createdAt = block.timestamp;

        _allIds.push(id);

        emit RequestCreated(id, msg.sender, recipient, token, amount, description);
    }

    /// @notice Settle a pending request. Native requests must send msg.value == amount.
    ///         ERC-20 requests must have approved this contract for at least `amount`.
    function pay(uint256 id) external payable {
        Request storage r = _requests[id];
        if (r.id == 0) revert NotFound();
        if (r.status != Status.Pending) revert NotPending();

        if (r.token == address(0)) {
            if (msg.value != r.amount) revert WrongAmount(r.amount, msg.value);
            (bool ok, ) = r.recipient.call{value: r.amount}("");
            if (!ok) revert TransferFailed();
        } else {
            if (msg.value != 0) revert NativeNotAllowed();
            if (!IERC20(r.token).transferFrom(msg.sender, r.recipient, r.amount)) {
                revert TransferFailed();
            }
        }

        r.status = Status.Paid;
        r.paidAt = block.timestamp;
        r.payer = msg.sender;

        emit RequestPaid(id, msg.sender, r.recipient, r.token, r.amount, block.timestamp);
    }

    /// @notice Cancel a pending request. Only the creator may cancel.
    function cancel(uint256 id) external {
        Request storage r = _requests[id];
        if (r.id == 0) revert NotFound();
        if (msg.sender != r.creator) revert NotCreator();
        if (r.status != Status.Pending) revert NotPending();

        r.status = Status.Cancelled;

        emit RequestCancelled(id, msg.sender);
    }

    /// @notice Full request record. Reverts when the id does not exist.
    function getRequest(uint256 id) external view returns (Request memory) {
        Request memory r = _requests[id];
        if (r.id == 0) revert NotFound();
        return r;
    }

    /// @notice Total number of requests ever created.
    function requestCount() external view returns (uint256) {
        return _allIds.length;
    }

    /// @notice Page through requests in creation order (oldest first).
    /// @param offset Starting index in the id list.
    /// @param limit  Maximum number of requests to return.
    function getRequests(uint256 offset, uint256 limit) external view returns (Request[] memory page) {
        uint256 total = _allIds.length;
        if (offset >= total) {
            return new Request[](0);
        }
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        page = new Request[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = _requests[_allIds[i]];
        }
    }

    /// @notice Ids of every request created by `creator`, in creation order.
    function idsByCreator(address creator) external view returns (uint256[] memory ids) {
        uint256 total = _allIds.length;
        uint256 count;
        for (uint256 i = 0; i < total; i++) {
            if (_requests[_allIds[i]].creator == creator) {
                count++;
            }
        }
        ids = new uint256[](count);
        uint256 j;
        for (uint256 i = 0; i < total; i++) {
            if (_requests[_allIds[i]].creator == creator) {
                ids[j++] = _allIds[i];
            }
        }
    }
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}