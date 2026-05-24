// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PramaamGITag is ERC721, Ownable {
    uint256 private _nextTokenId;

    // Optimized Web2.5 Storage: We store only the IPFS Metadata URI and mint dates on-chain.
    // Redundant strings (materials, categories, state) are saved permanently inside IPFS off-chain.
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public mintDates;
    mapping(address => bool) public verifiedSuppliers;
    mapping(uint256 => address[]) public ownershipHistory;

    event ProductMinted(
        uint256 indexed tokenId,
        address indexed supplier,
        string metadataURI,
        uint256 timestamp
    );

    event OwnershipTransferredOnChain(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    constructor() ERC721("Pramaam GI Tags", "PRAMAAM") Ownable(msg.sender) {
        _nextTokenId = 1; // Token IDs start at 1
    }

    // Mark supplier as verified
    function verifySupplier(address supplier) public onlyOwner {
        verifiedSuppliers[supplier] = true;
    }

    // Highly optimized gasless minting
    function mintGITag(
        address supplier,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(supplier != address(0), "Invalid supplier address");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        // Mint NFT directly to the artisan's custodial address
        _safeMint(supplier, tokenId);

        // Store essential links & timestamp
        _tokenURIs[tokenId] = metadataURI;
        mintDates[tokenId] = block.timestamp;
        ownershipHistory[tokenId].push(supplier);

        emit ProductMinted(tokenId, supplier, metadataURI, block.timestamp);

        return tokenId;
    }

    // Override standard tokenURI to return our IPFS metadata link
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    // Custom view function for lightweight verification
    function verifyProduct(uint256 tokenId) public view returns (
        address currentOwner,
        string memory metadataURI,
        uint256 mintDate
    ) {
        _requireOwned(tokenId);
        return (
            ownerOf(tokenId),
            _tokenURIs[tokenId],
            mintDates[tokenId]
        );
    }

    // Secure Admin Transfer: Exposes ERC721 transfer to the platform owner (backend operator)
    function adminTransfer(
        address from,
        address to,
        uint256 tokenId
    ) public onlyOwner {
        require(ownerOf(tokenId) == from, "From address is not the owner");
        require(to != address(0), "Invalid recipient address");
        
        _transfer(from, to, tokenId);
        
        ownershipHistory[tokenId].push(to);

        emit OwnershipTransferredOnChain(tokenId, from, to, block.timestamp);
    }

    // Get the history of who owned this item
    function getOwnershipHistory(uint256 tokenId) 
        public 
        view 
        returns (address[] memory) 
    {
        _requireOwned(tokenId);
        return ownershipHistory[tokenId];
    }
}
