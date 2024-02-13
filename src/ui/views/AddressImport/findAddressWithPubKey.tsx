import * as fcl from "@onflow/fcl";
import { openapiService } from 'background/service';

import {
    fclTestnetConfig,
    fclMainnetConfig,
    fclCrescendoConfig,
  } from 'background/fclConfig';
export const findAddressWithKey = async (pubKeyHex, address) => {
    if (!address) {
        const data = await getAddressByIndexer(pubKeyHex)
        
        if (data.accounts && data.accounts.length > 0) {
            const addresses = data.accounts.map((a) => fcl.withPrefix(fcl.sansPrefix(a.address).padStart(16, '0')))
            console.log("fcl ==>", fcl);
            const result = await Promise.all(addresses.map((a) => findAddres(a, pubKeyHex)))
            return result.flat()
        }
        return null
    }
    return await findAddres(address, pubKeyHex)
}

export default async function getAddressByIndexer(publicKey) {
    console.log("publicKey ==>", publicKey)
    const url = `https://key-indexer.production.flow.com/key/${publicKey}`;
    console.log("url ==>", url)
    const result = await fetch(url);
    const json = await result.json();
    console.log("result ==>", json);
    return json
  }
  

const findAddres = async (address, pubKeyHex) => {
    await fclMainnetConfig();
    console.log("fclMainnetConfig ==>", fclMainnetConfig());
    console.log("address ==>", address);
    console.log("address ==>", pubKeyHex);
    const account = await fcl.account(address);
    const keys = account.keys
    .filter(key => key.publicKey === pubKeyHex && !key.revoked)
    .filter(key => key.weight >= 1000 )
    
    if (keys.length == 0) {
        return null
    }

    return keys.map(key => {
        return {
            address: address,
            keyIndex: parseInt(key.index),
            weight: key.weight,
            hashAlgo: key.hashAlgoString,
            signAlgo: key.signAlgoString,
            pubK: key.publicKey
        }
    })
}
