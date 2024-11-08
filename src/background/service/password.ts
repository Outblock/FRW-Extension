import { createSessionStore } from 'background/utils';
import googleDriveService from './googleDrive';

interface PasswordStore {
  password: string;
  rand: string;
  veryfiPwd: string;
}

class Password {
  store!: PasswordStore;
  // rand  = (Math.random() + 1).toString(36).substring(7);

  init = async () => {
    this.store = await createSessionStore<PasswordStore>({
      name: 'password',
      template: {
        password: '',
        veryfiPwd: '',
        rand: (Math.random() + 1).toString(36).substring(7),
      },
    });
  };

  clear = () => {
    this.store = {
      password: '',
      veryfiPwd: '',
      rand: (Math.random() + 1).toString(36).substring(7),
    };
  };

  getPassword = async (): Promise<any> => {
    const encryptedPass = this.store.password;
    const password = await googleDriveService.decrypt(encryptedPass, this.store.rand);
    return password;
  };

  setPassword = async (password: string) => {
    const encryptedPass = await googleDriveService.encrypt(password, this.store.rand);
    this.store.password = encryptedPass;
  };
}

export default new Password();
