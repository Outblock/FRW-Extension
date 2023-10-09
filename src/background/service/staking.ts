import { createPersistStore } from 'background/utils';
import * as t from '@onflow/types';
import * as fcl from '@onflow/fcl'
import * as secp from '@noble/secp256k1';
import HDWallet from 'ethereum-hdwallet';
import { keyringService, openapiService,userWalletService } from 'background/service';
import wallet from 'background/controller/wallet';
import { getApp } from 'firebase/app';
import { getAuth } from '@firebase/auth';
import { withPrefix } from '@/ui/utils/address';
import fetchConfig from 'background/utils/remoteConfig';
import { storage } from '@/background/webapi';

interface StakingStore {
    nodeList: Record<string, any>;
}

class Staking {

  store!: StakingStore;

  init = async () => {
    this.store = await createPersistStore<StakingStore>({
      name: 'staking',
      template: {
        nodeList:{},
      },
    });
  };

  withDrawLocked = async(address): Promise<string>=> {
    return await userWalletService.sendTransaction(
      `
      import FungibleToken from 0xFUNGIBLETOKENADDRESS
      import FlowToken from 0xFLOWTOKENADDRESS
      import LockedTokens from 0xLOCKEDTOKENADDRESS

      transaction(amount: UFix64) {

          let holderRef: &LockedTokens.TokenHolder
          let vaultRef: &FlowToken.Vault

          prepare(acct: AuthAccount) {
              self.holderRef = acct.borrow<&LockedTokens.TokenHolder>(from: LockedTokens.TokenHolderStoragePath)
                  ?? panic("Could not borrow a reference to TokenHolder")

              self.vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                  ?? panic("Could not borrow flow token vault ref")
          }

          execute {
              self.vaultRef.deposit(from: <-self.holderRef.withdraw(amount: amount))
          }
      }
      `
      ,
      [fcl.arg(address, t.Address),]
    );
  }


  withDrawUnstaked = async(address): Promise<string>=> {
    return await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Request to withdraw unstaked tokens for the specified node or delegator in the staking collection
      /// The tokens are automatically deposited to the unlocked account vault first,
      /// And then any locked tokens are deposited into the locked account vault if it is there

      transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection

          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }

          execute {
              self.stakingCollectionRef.withdrawUnstakedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
          }
      }
      `
      ,
      [fcl.arg(address, t.Address),]
    );
  }

  nodeInfo = async(address): Promise<string>=> {

    return await fcl.query({
      cadence: `
      import FlowStakingCollection from 0x8d0e87b65159ae63
      import FlowIDTableStaking from 0x8624b52f9ddcd04a

      pub struct SummaryStakeDelegateInfo {

          pub var nodeCount: UInt64
          pub var delegateCount: UInt64

          pub var totalTokensStaked: UFix64
          pub var totalTokensCommitted: UFix64
          pub var totalTokensUnstaking: UFix64
          pub var totalTokensUnstaked: UFix64
          pub var totalTokensRewarded: UFix64
          pub var totalTokensRequestedToUnstake: UFix64

          pub var stakeTokensStaked: UFix64
          pub var stakeTokensCommitted: UFix64
          pub var stakeTokensUnstaking: UFix64
          pub var stakeTokensUnstaked: UFix64
          pub var stakeTokensRewarded: UFix64
          pub var stakeTokensRequestedToUnstake: UFix64

          pub var delegateTokensStaked: UFix64
          pub var delegateTokensCommitted: UFix64
          pub var delegateTokensUnstaking: UFix64
          pub var delegateTokensUnstaked: UFix64
          pub var delegateTokensRewarded: UFix64
          pub var delegateTokensRequestedToUnstake: UFix64

          init(allNodeInfo: [FlowIDTableStaking.NodeInfo], allDelegateInfo: [FlowIDTableStaking.DelegatorInfo]) {

              self.nodeCount = UInt64(0)
              self.delegateCount = UInt64(0)

              self.totalTokensStaked = UFix64(0)
              self.totalTokensCommitted = UFix64(0)
              self.totalTokensUnstaking = UFix64(0)
              self.totalTokensUnstaked = UFix64(0)
              self.totalTokensRewarded = UFix64(0)
              self.totalTokensRequestedToUnstake = UFix64(0)

              self.stakeTokensStaked = UFix64(0)
              self.stakeTokensCommitted = UFix64(0)
              self.stakeTokensUnstaking = UFix64(0)
              self.stakeTokensUnstaked = UFix64(0)
              self.stakeTokensRewarded = UFix64(0)
              self.stakeTokensRequestedToUnstake = UFix64(0)

              self.delegateTokensStaked = UFix64(0)
              self.delegateTokensCommitted = UFix64(0)
              self.delegateTokensUnstaking = UFix64(0)
              self.delegateTokensUnstaked = UFix64(0)
              self.delegateTokensRewarded = UFix64(0)
              self.delegateTokensRequestedToUnstake = UFix64(0)

              for nodeInfo in allNodeInfo {
                  self.nodeCount = self.nodeCount + 1

                  self.totalTokensStaked = self.totalTokensStaked + nodeInfo.tokensStaked
                  self.totalTokensCommitted = self.totalTokensCommitted + nodeInfo.tokensCommitted
                  self.totalTokensUnstaking = self.totalTokensUnstaking + nodeInfo.tokensUnstaking
                  self.totalTokensUnstaked = self.totalTokensUnstaked + nodeInfo.tokensUnstaked
                  self.totalTokensRewarded = self.totalTokensRewarded + nodeInfo.tokensRewarded
                  self.totalTokensRequestedToUnstake = self.totalTokensRequestedToUnstake + nodeInfo.tokensRequestedToUnstake

                  self.stakeTokensStaked = self.stakeTokensStaked + nodeInfo.tokensStaked
                  self.stakeTokensCommitted = self.stakeTokensCommitted + nodeInfo.tokensCommitted
                  self.stakeTokensUnstaking = self.stakeTokensUnstaking + nodeInfo.tokensUnstaking
                  self.stakeTokensUnstaked = self.stakeTokensUnstaked + nodeInfo.tokensUnstaked
                  self.stakeTokensRewarded = self.stakeTokensRewarded + nodeInfo.tokensRewarded
                  self.stakeTokensRequestedToUnstake = self.stakeTokensRequestedToUnstake + nodeInfo.tokensRequestedToUnstake
              }

              for delegateInfo in allDelegateInfo {
                  self.delegateCount = self.delegateCount + 1

                  self.totalTokensStaked = self.totalTokensStaked + delegateInfo.tokensStaked
                  self.totalTokensCommitted = self.totalTokensCommitted + delegateInfo.tokensCommitted
                  self.totalTokensUnstaking = self.totalTokensUnstaking + delegateInfo.tokensUnstaking
                  self.totalTokensUnstaked = self.totalTokensUnstaked + delegateInfo.tokensUnstaked
                  self.totalTokensRewarded = self.totalTokensRewarded + delegateInfo.tokensRewarded
                  self.totalTokensRequestedToUnstake = self.totalTokensRequestedToUnstake + delegateInfo.tokensRequestedToUnstake

                  self.delegateTokensStaked = self.delegateTokensStaked + delegateInfo.tokensStaked
                  self.delegateTokensCommitted = self.delegateTokensCommitted + delegateInfo.tokensCommitted
                  self.delegateTokensUnstaking = self.delegateTokensUnstaking + delegateInfo.tokensUnstaking
                  self.delegateTokensUnstaked = self.delegateTokensUnstaked + delegateInfo.tokensUnstaked
                  self.delegateTokensRewarded = self.delegateTokensRewarded + delegateInfo.tokensRewarded
                  self.delegateTokensRequestedToUnstake = self.delegateTokensRequestedToUnstake + delegateInfo.tokensRequestedToUnstake
              }

          }
      }

      pub fun main(account: Address): SummaryStakeDelegateInfo? {
          let doesAccountHaveStakingCollection = FlowStakingCollection.doesAccountHaveStakingCollection(address: account)
          if (!doesAccountHaveStakingCollection) {
              return nil
          }

          let allNodeInfo: [FlowIDTableStaking.NodeInfo] = FlowStakingCollection.getAllNodeInfo(address: account)
          let allDelegateInfo: [FlowIDTableStaking.DelegatorInfo] = FlowStakingCollection.getAllDelegatorInfo(address: account)

          return SummaryStakeDelegateInfo(allNodeInfo: allNodeInfo, allDelegateInfo: allDelegateInfo)
      }
    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
  }

  delegateInfo = async(address): Promise<string>=> {

    const result =  await fcl.query({
      cadence: `
      import FlowStakingCollection from 0x8d0e87b65159ae63
      import FlowIDTableStaking from 0x8624b52f9ddcd04a
      import LockedTokens from 0x8d0e87b65159ae63

      pub struct DelegateInfo {
          pub let delegatorID: UInt32
          pub let nodeID: String
          pub let tokensCommitted: UFix64
          pub let tokensStaked: UFix64
          pub let tokensUnstaking: UFix64
          pub let tokensRewarded: UFix64
          pub let tokensUnstaked: UFix64
          pub let tokensRequestedToUnstake: UFix64

          // Projected Values

          pub let id: String
          pub let role: UInt8
          pub let unstakableTokens: UFix64
          pub let delegatedNodeInfo: FlowIDTableStaking.NodeInfo
          pub let restakableUnstakedTokens: UFix64

          init(delegatorInfo: FlowIDTableStaking.DelegatorInfo) {
              self.delegatorID = delegatorInfo.id
              self.nodeID = delegatorInfo.nodeID
              self.tokensCommitted = delegatorInfo.tokensCommitted
              self.tokensStaked = delegatorInfo.tokensStaked
              self.tokensUnstaking = delegatorInfo.tokensUnstaking
              self.tokensUnstaked = delegatorInfo.tokensUnstaked
              self.tokensRewarded = delegatorInfo.tokensRewarded
              self.tokensRequestedToUnstake = delegatorInfo.tokensRequestedToUnstake

              // Projected Values
              let nodeInfo = FlowIDTableStaking.NodeInfo(nodeID: delegatorInfo.nodeID)
              self.delegatedNodeInfo = nodeInfo
              self.id = nodeInfo.id
              self.role = nodeInfo.role
              self.unstakableTokens = self.tokensStaked + self.tokensCommitted
              self.restakableUnstakedTokens = self.tokensUnstaked + self.tokensRequestedToUnstake
          }
      }

      pub fun main(account: Address): {String: {UInt32: DelegateInfo}}? {
          let doesAccountHaveStakingCollection = FlowStakingCollection.doesAccountHaveStakingCollection(address: account)
          if (!doesAccountHaveStakingCollection) {
              return nil
          }

          let delegatorIDs: [FlowStakingCollection.DelegatorIDs] = FlowStakingCollection.getDelegatorIDs(address: account)

          let formattedDelegatorInfo: {String: {UInt32: DelegateInfo}} = {}

          for delegatorID in delegatorIDs {
              if let _formattedDelegatorInfo = formattedDelegatorInfo[delegatorID.delegatorNodeID] {
                  let delegatorInfo: FlowIDTableStaking.DelegatorInfo = FlowIDTableStaking.DelegatorInfo(nodeID: delegatorID.delegatorNodeID, delegatorID: delegatorID.delegatorID)
                  _formattedDelegatorInfo[delegatorID.delegatorID] = DelegateInfo(delegatorInfo: delegatorInfo)
              } else {
                  let delegatorInfo: FlowIDTableStaking.DelegatorInfo = FlowIDTableStaking.DelegatorInfo(nodeID: delegatorID.delegatorNodeID, delegatorID: delegatorID.delegatorID)
                  formattedDelegatorInfo[delegatorID.delegatorNodeID] = { delegatorID.delegatorID: DelegateInfo(delegatorInfo: delegatorInfo)}
              }
          }

          return formattedDelegatorInfo
      }
    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    this.store.nodeList = result;
    return result;
  }

  delegateStore = async() => {
    return this.store.nodeList;
  }

  stakeInfo = async(address): Promise<string>=> {

    const result =  await fcl.query({
      cadence: `
      import FlowStakingCollection from 0x8d0e87b65159ae63
      import FlowIDTableStaking from 0x8624b52f9ddcd04a
      import LockedTokens from 0x8d0e87b65159ae63

      pub struct StakeInfo {
          pub let id: String
          pub let role: UInt8
          pub let networkingAddress: String
          pub let networkingKey: String
          pub let stakingKey: String
          pub let tokensStaked: UFix64
          pub let totalTokensStaked: UFix64
          pub let tokensCommitted: UFix64
          pub let tokensUnstaking: UFix64
          pub let tokensUnstaked: UFix64
          pub let tokensRewarded: UFix64

          pub let delegators: [UInt32]
          pub let delegatorIDCounter: UInt32
          pub let tokensRequestedToUnstake: UFix64
          pub let initialWeight: UInt64

          // Projected Values
          pub let nodeID: String
          pub let unstakableTokens: UFix64
          pub let tokensDelegated: UFix64
          pub let restakableUnstakedTokens: UFix64

          pub let machineAccountAddress: Address?
          pub let machineAccountBalance: UFix64?

          init(nodeInfo: FlowIDTableStaking.NodeInfo, machineAccountInfo: FlowStakingCollection.MachineAccountInfo?) {
              self.id = nodeInfo.id
              self.role = nodeInfo.role
              self.networkingAddress = nodeInfo.networkingAddress
              self.networkingKey = nodeInfo.networkingKey
              self.stakingKey = nodeInfo.stakingKey
              self.tokensStaked = nodeInfo.tokensStaked
              self.totalTokensStaked = nodeInfo.totalStakedWithDelegators()
              self.tokensCommitted = nodeInfo.tokensCommitted
              self.tokensUnstaking = nodeInfo.tokensUnstaking
              self.tokensUnstaked = nodeInfo.tokensUnstaked
              self.tokensRewarded = nodeInfo.tokensRewarded

              self.delegators = nodeInfo.delegators
              self.delegatorIDCounter = nodeInfo.delegatorIDCounter
              self.tokensRequestedToUnstake = nodeInfo.tokensRequestedToUnstake
              self.initialWeight = nodeInfo.initialWeight

              // Projected Values
              self.nodeID = nodeInfo.id
              self.unstakableTokens = self.tokensStaked + self.tokensCommitted
              let nodeStakedBalanceWithDelegators = nodeInfo.totalStakedWithDelegators()
              self.tokensDelegated = nodeStakedBalanceWithDelegators - nodeInfo.tokensStaked
              self.restakableUnstakedTokens = self.tokensUnstaked + self.tokensRequestedToUnstake

              if let _machineAccountInfo = machineAccountInfo {
                  let _machineAccountAddress = _machineAccountInfo.getAddress()

                  let machineAccount = getAccount(_machineAccountAddress)

                  self.machineAccountAddress = _machineAccountAddress
                  self.machineAccountBalance = machineAccount.balance
              } else {
                  self.machineAccountAddress = nil
                  self.machineAccountBalance = nil
              }
          }
      }

      pub fun main(account: Address): {String: StakeInfo}? {
          let doesAccountHaveStakingCollection = FlowStakingCollection.doesAccountHaveStakingCollection(address: account)
          if (!doesAccountHaveStakingCollection) {
              return nil
          }

          let formattedNodeInfo: {String: StakeInfo} = {}
          let allNodeInfo: [FlowIDTableStaking.NodeInfo] = FlowStakingCollection.getAllNodeInfo(address: account)
          let machineAccounts: {String: FlowStakingCollection.MachineAccountInfo} = FlowStakingCollection.getMachineAccounts(address: account)

          for nodeInfo in allNodeInfo {
              formattedNodeInfo[nodeInfo.id] = StakeInfo(nodeInfo: nodeInfo, machineAccountInfo: machineAccounts[nodeInfo.id])
          }

          return formattedNodeInfo
      }
    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  }

  checkSetup = async(address): Promise<boolean> => {
    const result =  await fcl.query({
      cadence: `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Determines if an account is set up with a Staking Collection

      pub fun main(address: Address): Bool {
          return FlowStakingCollection.doesAccountHaveStakingCollection(address: address)
      }
      `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  }

  setup = async(id): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FungibleToken from 0xFungibleToken
      import FlowToken from 0x1654653399040a61
      import LockedTokens from 0x8d0e87b65159ae63
      import FlowIDTableStaking from 0x8624b52f9ddcd04a
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// This transaction sets up an account to use a staking collection
      /// It will work regardless of whether they have a regular account, a two-account locked tokens setup,
      /// or staking objects stored in the unlocked account

      transaction {
          prepare(signer: AuthAccount) {

              // If there isn't already a staking collection
              if signer.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath) == nil {

                  // Create private capabilities for the token holder and unlocked vault
                  let lockedHolder = signer.link<&LockedTokens.TokenHolder>(/private/flowTokenHolder, target: LockedTokens.TokenHolderStoragePath)!
                  let flowToken = signer.link<&FlowToken.Vault>(/private/flowTokenVault, target: /storage/flowTokenVault)!
                  
                  // Create a new Staking Collection and put it in storage
                  if lockedHolder.check() {
                      signer.save(<-FlowStakingCollection.createStakingCollection(unlockedVault: flowToken, tokenHolder: lockedHolder), to: FlowStakingCollection.StakingCollectionStoragePath)
                  } else {
                      signer.save(<-FlowStakingCollection.createStakingCollection(unlockedVault: flowToken, tokenHolder: nil), to: FlowStakingCollection.StakingCollectionStoragePath)
                  }

                  // Create a public link to the staking collection
                  signer.link<&FlowStakingCollection.StakingCollection{FlowStakingCollection.StakingCollectionPublic}>(
                      FlowStakingCollection.StakingCollectionPublicPath,
                      target: FlowStakingCollection.StakingCollectionStoragePath
                  )
              }

              // borrow a reference to the staking collection
              let collectionRef = signer.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow staking collection reference")

              // If there is a node staker object in the account, put it in the staking collection
              if signer.borrow<&FlowIDTableStaking.NodeStaker>(from: FlowIDTableStaking.NodeStakerStoragePath) != nil {
                  let node <- signer.load<@FlowIDTableStaking.NodeStaker>(from: FlowIDTableStaking.NodeStakerStoragePath)!
                  collectionRef.addNodeObject(<-node, machineAccountInfo: nil)
              }

              // If there is a delegator object in the account, put it in the staking collection
              if signer.borrow<&FlowIDTableStaking.NodeDelegator>(from: FlowIDTableStaking.DelegatorStoragePath) != nil {
                  let delegator <- signer.load<@FlowIDTableStaking.NodeDelegator>(from: FlowIDTableStaking.DelegatorStoragePath)!
                  collectionRef.addDelegatorObject(<-delegator)
              }
          }
      }
      `
      ,
      []
    );
    return result;
  }

  createDelegator = async(amount, node): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Registers a delegator in the staking collection resource
      /// for the specified nodeID and the amount of tokens to commit

      transaction(id: String, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection

          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }

          execute {
              self.stakingCollectionRef.registerDelegator(nodeID: id, amount: amount)      
          }
      }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(amount, t.UFix64),]
    );
    return result;
  }

  createStake = async(amount, node, delegate): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Commits new tokens to stake for the specified node or delegator in the staking collection
      /// The tokens from the locked vault are used first, if it exists
      /// followed by the tokens from the unlocked vault

      transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection

          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }

          execute {
              self.stakingCollectionRef.stakeNewTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
          }
      }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(delegate, t.UInt32), fcl.arg(amount, t.UFix64),]
    );
    return result;
  }


  withdrawReward = async(amount, node, delegate): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

        /// Request to withdraw rewarded tokens for the specified node or delegator in the staking collection
        /// The tokens are automatically deposited to the unlocked account vault first,
        /// And then any locked tokens are deposited into the locked account vault

        transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
            
            let stakingCollectionRef: &FlowStakingCollection.StakingCollection

            prepare(account: AuthAccount) {
                self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                    ?? panic("Could not borrow ref to StakingCollection")
            }

            execute {
                self.stakingCollectionRef.withdrawRewardedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
            }
        }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(delegate, t.UInt32), fcl.arg(amount, t.UFix64),]
    );
    return result;
  }


  restakeReward = async(amount, node, delegate): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Commits rewarded tokens to stake for the specified node or delegator in the staking collection

      transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection
      
          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }
      
          execute {
              self.stakingCollectionRef.stakeRewardedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
          }
      }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(delegate, t.UInt32), fcl.arg(amount, t.UFix64),]
    );
    return result;
  }


  restakeUnstaked = async(amount, node, delegate): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Commits unstaked tokens to stake for the specified node or delegator in the staking collection

      transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection

          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }

          execute {
              self.stakingCollectionRef.stakeUnstakedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
          }
      }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(delegate, t.UInt32), fcl.arg(amount, t.UFix64),]
    );
    return result;
  }


  withdrawUnstaked = async(amount, node, delegate): Promise<string>=> {

    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Request to withdraw unstaked tokens for the specified node or delegator in the staking collection
      /// The tokens are automatically deposited to the unlocked account vault first,
      /// And then any locked tokens are deposited into the locked account vault if it is there

      transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection

          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }

          execute {
              self.stakingCollectionRef.withdrawUnstakedTokens(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
          }
      }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(delegate, t.UInt32), fcl.arg(amount, t.UFix64),]
    );
    return result;
  }


  unstake = async(amount, node, delegate): Promise<string>=> {
    console.log(amount);
    console.log(node);
    console.log(delegate);
    const result =  await userWalletService.sendTransaction(
      `
      import FlowStakingCollection from 0x8d0e87b65159ae63

      /// Requests unstaking for the specified node or delegator in the staking collection

      transaction(nodeID: String, delegatorID: UInt32?, amount: UFix64) {
          
          let stakingCollectionRef: &FlowStakingCollection.StakingCollection

          prepare(account: AuthAccount) {
              self.stakingCollectionRef = account.borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)
                  ?? panic("Could not borrow ref to StakingCollection")
          }

          execute {
              self.stakingCollectionRef.requestUnstaking(nodeID: nodeID, delegatorID: delegatorID, amount: amount)
          }
      }
      `
      ,
      [fcl.arg(node, t.String), fcl.arg(delegate, t.UInt32), fcl.arg(amount, t.UFix64),]
    );
    console.log(result);
    return result;
  }


  getApr = async(): Promise<string>=> {
    return await fcl.query({
      cadence: `
        import FlowIDTableStaking from 0x8624b52f9ddcd04a

        pub fun main(): UFix64 {
            let apr = FlowIDTableStaking.getEpochTokenPayout() / FlowIDTableStaking.getTotalStaked() / 7.0 * 365.0 * (1.0 - FlowIDTableStaking.getRewardCutPercentage())
            return apr
        }
      `
    });

  }



}

export default new Staking();
