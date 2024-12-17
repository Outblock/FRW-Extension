export type SignAlgoType = 'ECDSA_P256' | 'ECDSA_secp256k1' | 'unknown';

export type HashAlgoType = 'SHA256' | 'SHA2_256' | 'SHA3_256' | 'SHA2_384' | 'SHA3_384' | 'unknown';
export type KeyType = 'Passkey' | 'GoogleDrive' | 'SeedPhrase' | 'Keystore' | 'PrivateKey';

export type RecoveryMechanismType = KeyType | 'Multi-Backup' | 'Device-Backup';
