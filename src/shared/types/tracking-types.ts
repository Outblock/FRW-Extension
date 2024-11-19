type OnRampSourceType = 'moonpay' | 'coinbase';

type KeyType = 'passkey' | 'google_drive' | 'seed_phrase' | 'keystore' | 'private_key';

type RecoveryMechanismType =
  | 'multi-backup'
  | 'seed-phrase'
  | 'private_key'
  | 'KeyStore'
  | 'device_backup';

type AddressType = 'flow' | 'evm' | 'child' | 'coa';

type SignAlgoType = 'ECDSA_P256' | 'ECDSA_secp256k1';

type HashAlgoType = 'SHA256' | 'SHA3_256';

export type TrackingEvents = {
  // General Events
  script_error: {
    error: string; // Error message of the script, e.g., Rate limit exceeded
    script_id: string; // Script name from script API, e.g. checkCoaLink
  };
  delegation_created: {
    address: string; // Address of the account that delegated
    node_id: string; // ID of the node that was delegated to
    amount: number; // Amount of FLOW. e.g. 200.12
  };
  on_ramp_clicked: {
    source: OnRampSourceType; // The on ramp platform the user choose e.g. moonpay or coinbase
  };
  coa_creation: {
    tx_id: string; // The transaction ID
    flow_address: string; //
    error_message?: string; // Any error message
  };
  security_tool: {
    type: 'biometric' | 'pin' | 'none';
  };

  // Backup Events
  multi_backup_created: {
    address: string; // Address of the account that set up multi-backup
    providers: KeyType[]; // Providers used in the multi-backup, GoogleDrive, iCloud, Seed e.g. google_drive  icloud seed_phrase
  };
  multi_backup_creation_failed: {
    address: string; // Address of the account that set up multi-backup
    providers: KeyType[]; // Providers used in the multi-backup, GoogleDrive, iCloud, Seed e.g. google_drive  icloud seed_phrase
  };

  // Transaction Events

  cadence_transaction_signed: {
    cadence: string; // SHA256 Hashed Cadence that was signed.
    tx_id: string; // String of the transaction ID.
    authorizers: string[]; // Comma separated list of authorizer account address in the transaction
    proposer: string; // Address of the transactions proposer.
    payer: string; // Payer of the transaction.
    success: boolean; // Boolean of if the transaction was sent successful or not. true/false
  };
  evm_transaction_signed: {
    success: boolean; // Boolean of if the transaction was sent successful or not. true/false
    flow_address: string; // Address of the account that signed the transaction
    evm_address: string; // EVM Address of the account that signed the transaction
    tx_id: string; // transaction id
  };
  ft_transfer: {
    from_address: string; // Address of the account that transferred the FT
    to_address: string; // Address of the account that received the FT
    type: string; // Type of FT sent (e.g., "FLOW", "USDf")
    amount: number; // The amount of FT
    ft_identifier: string; // The identifier of fungible token
  };
  nft_transfer: {
    from_address: string; // Address of the account that transferred the FT
    to_address: string; // Address of the account that received the FT
    nft_identifier: string; // The identifier of non fungible token
    tx_id: string; // ID of the NFT that was transferred
    from_type: AddressType; // The type of from address whether it's flow, child account, coa or evm account.
    to_type: AddressType; // The type of to address whether it's flow, child account, coa or evm account.
    isMove: boolean; // The transfer flow is triggerred from Move account
  };

  transaction_result: {
    tx_id: string; // The transaction id
    is_successful: boolean; // If the transaction is successful
    error_message?: string; // Error message of transaction
  };
  // Account Events
  account_created: {
    public_key: string; // The public key used for creating the new account
    key_type: KeyType; // The key type of the account
    sign_algo: SignAlgoType; // Signature algorithm of the key
    hash_algo: HashAlgoType; // Hash algo Hash algorithm of the key
  };

  account_creation_time: {
    // Timing Events
  };
  account_recovered: {
    address: string; // Address that was recovered
    mechanism: RecoveryMechanismType; // The way the account was recovered
    methods: KeyType[]; // Array of providers used in the multi-backup, GoogleDrive, iCloud, Seed
  };
};
