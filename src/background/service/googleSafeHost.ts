import axios from 'axios';
import { createPersistStore } from 'background/utils';

interface GoogleHostModel {
  url: string;
}

interface GoogleSafeHostStore {
  blockList: string[];
  expiry: number;
}

// https://developers.google.com/safe-browsing/v4/lookup-api
// https://transparencyreport.google.com/safe-browsing/search
class GoogleSafeHost {
  baseURL = 'https://safebrowsing.googleapis.com';
  key = process.env.GOOGLE_API;
  version = '1.0'
  safebrowsing = axios.create({
    baseURL: this.baseURL,
  });

  store!: GoogleSafeHostStore;

  init = async () => {
    this.store = await createPersistStore<GoogleSafeHostStore>({
      name: 'nft',
      template: {
        blockList: [],
        expiry: 0,
      },
    });
  };

  getExpiry = () => {
    return this.store.expiry;
  };

  // 10 minutes
  setExpiry = (expiry: number = 1000 * 60 * 60) => {
    this.store.expiry = new Date().getTime() + expiry;
  };

  checkHostSafe = async (hosts: string[]): Promise<string[]> => {
    // console.log('checkHostSafe =>', hosts)
    if (hosts.length === 0) {
      return []
    }
    const hostList= hosts.map((host) => new URL(host).host)
    const unique = Array.from(new Set(hostList)).map((host) => <GoogleHostModel>({url: host}))
    const {data} = await this.sendRequest(unique); 
    this.setExpiry()
    if (data.matches && data.matches > 0) {
      const blockList = data.matches.map(item => item.threat.url)
      blockList.filter(block => !this.store.blockList.includes(block))
        .forEach(block => this.store.blockList.push(block));
      return blockList
    }
    return []
  }

  getBlockList = async (hosts: string[] = [], forceCheck = false): Promise<string[]> => {
    // console.log('getBlockList =>', hosts, forceCheck)
    if (forceCheck) {
      return await this.checkHostSafe(hosts)
    }

    const now = new Date().getTime()
    // console.log('getBlockList now =>', now, this.store.expiry)
    if (now > this.store.expiry) {
      this.store.blockList = []
      return await this.checkHostSafe(hosts)
    }

    // console.log('getBlockList aa =>', now, this.store.blockList)
    return this.store.blockList
  }

  sendRequest = async (
    urls: GoogleHostModel[],
  ) => {

    return await axios({
      method: 'post',
      url: this.baseURL + '/v4/threatMatches:find',
      params: {key: this.key},
      data: {
        client: {
          clientId:      'lilico-extension',
          clientVersion: '0.0.1'
        },
        threatInfo: {
          threatTypes:      ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION', 'THREAT_TYPE_UNSPECIFIED'],
          platformTypes:    ['ALL_PLATFORMS'],
          threatEntryTypes: ['URL'],
          threatEntries: [
            urls
          ]
        }
      }
    });
  };
}

export default new GoogleSafeHost();
