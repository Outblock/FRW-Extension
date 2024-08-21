import Message from './index';
class PortMessage extends Message {
  port: chrome.runtime.Port | null = null;
  listenCallback: any;

  constructor(port?: chrome.runtime.Port) {
    super();

    if (port) {
      this.port = port;
    }
  }

  connect = (name?: string) => {
    // console.log('PortMessage connect 2 ->', name)
    this.port = chrome.runtime.connect('', name ? { name } : undefined);
    this.port.onMessage.addListener(({ _type_, data }) => {
      // console.log('PortMessage connect ->', _type_, data)
      if (_type_ === `${this._EVENT_PRE}message`) {
        this.emit('message', data);
        return;
      }

      if (_type_ === `${this._EVENT_PRE}response`) {
        this.onResponse(data);
      }
    });

    this.port.onDisconnect.addListener(() => this.connect(name));
    return this;
  };

  listen = (listenCallback: any) => {
    if (!this.port) return;
    this.listenCallback = listenCallback;
    this.port.onMessage.addListener(({ _type_, data }) => {
      // console.log('PortMessage listen ->', _type_, data)
      if (_type_ === `${this._EVENT_PRE}request`) {
        this.onRequest(data);
      }
    });
    return this;
  };

  send = (type, data) => {
    if (!this.port) return;
    // console.log('PortMessage send', this.port, type, data, this._EVENT_PRE);
    try {
      this.port.postMessage({ _type_: `${this._EVENT_PRE}${type}`, data });
    } catch (e) {
      // DO NOTHING BUT CATCH THIS ERROR
      console.log('PortMessage error: ', e)
    }
  };

  dispose = () => {
    this._dispose();
    this.port?.disconnect();
  };
}

export default PortMessage;
