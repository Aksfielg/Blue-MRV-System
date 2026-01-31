import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }
    
    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Switch to Polygon Mumbai testnet
      await this.switchToPolygon();
      
      return address;
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }
  
  private async switchToPolygon() {
    const chainId = '0x13881'; // Mumbai testnet
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        await this.addPolygonNetwork();
      } else {
        throw error;
      }
    }
  }
  
  private async addPolygonNetwork() {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x13881',
        chainName: 'Polygon Mumbai Testnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/']
      }]
    });
  }
  
  async getCarbonBalance(address: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const contract = this.getCarbonTokenContract();
    const balance = await contract.getCreditBalance(address);
    return ethers.utils.formatUnits(balance, 0);
  }
  
  async getPlotDetails(plotId: number) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const contract = this.getPlotRegistryContract();
    return await contract.getPlot(plotId);
  }
  
  async purchaseMarketplaceItem(listingId: number, qrData: string) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const contract = this.getMarketplaceContract();
    const tx = await contract.purchaseItem(listingId, qrData);
    return await tx.wait();
  }
  
  async redeemVoucher(tokenId: number) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    const contract = this.getVoucherNFTContract();
    const tx = await contract.redeemVoucher(tokenId);
    return await tx.wait();
  }
  
  private getCarbonTokenContract() {
    const contractAddress = import.meta.env.VITE_CARBON_TOKEN_ADDRESS;
    const abi = [
      "function getCreditBalance(address account) view returns (uint256)",
      "function balanceOf(address account, uint256 id) view returns (uint256)",
      "function transferCredits(address from, address to, uint256 amount) external"
    ];
    
    return new ethers.Contract(contractAddress, abi, this.signer);
  }
  
  private getPlotRegistryContract() {
    const contractAddress = import.meta.env.VITE_PLOT_REGISTRY_ADDRESS;
    const abi = [
      "function getPlot(uint256 plotId) view returns (tuple(uint256 id, address owner, string ipfsHash, uint256 areaSqm, string ecosystemType, bool isVerified, uint256 survivalRate, uint256 estimatedCO2, uint256 timestamp, address verifier))",
      "function getTotalPlots() view returns (uint256)",
      "function getVerifiedPlotsCount() view returns (uint256)"
    ];
    
    return new ethers.Contract(contractAddress, abi, this.signer);
  }
  
  private getMarketplaceContract() {
    const contractAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS;
    const abi = [
      "function purchaseItem(uint256 listingId, string memory qrData) external returns (uint256)",
      "function getListing(uint256 listingId) view returns (tuple(uint256 id, address vendor, string name, string description, string category, uint256 priceBCC, uint256 availableQuantity, uint256 totalSold, bool isActive, uint256 timestamp))"
    ];
    
    return new ethers.Contract(contractAddress, abi, this.signer);
  }
  
  private getVoucherNFTContract() {
    const contractAddress = import.meta.env.VITE_VOUCHER_NFT_ADDRESS;
    const abi = [
      "function redeemVoucher(uint256 tokenId) external",
      "function isRedeemed(uint256 tokenId) view returns (bool)",
      "function getVoucher(uint256 tokenId) view returns (tuple(uint256 tokenId, address buyer, address vendor, uint256 listingId, uint256 creditAmount, string qrData, bool isRedeemed, uint256 issuedAt, uint256 redeemedAt))"
    ];
    
    return new ethers.Contract(contractAddress, abi, this.signer);
  }
  
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const network = await this.provider.getNetwork();
    return {
      chainId: network.chainId,
      name: network.name
    };
  }
  
  async getGasPrice() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    return await this.provider.getGasPrice();
  }
}

export const web3Service = new Web3Service();