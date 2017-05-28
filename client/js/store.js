import {observable, computed} from 'mobx';

class Store {

  @observable selectedMessage = null;
  @observable goToMessage = null;
  @observable searchTerm = '';
  @observable display = null;
  @observable channels = [];
  @observable users = [];
  @observable usersById = {};

  @observable scrollPos = 0;
  @observable isLoading = false;

  constructor() {
    this.loadChannels();
    this.loadUsers();
  }

  alert(message, isError) {
    if (isError) {
      console.error(message);
    } else {
      console.log(message);
    }
  }

  async fetch(url, isText) {
    this.isLoading = true;

    try {
      const res = await fetch(url).then(n => isText ? n.text() : n.json());
      this.isLoading = false;
      return res;

    } catch (e) {
      this.isLoading = false;
      this.alert(e.message);
      throw e;
    }
  }

  async search(channelName) {
    if (!this.searchTerm) return;
    const channels = await this.fetch('/search/' + this.searchTerm + (channelName ? '?channel=' + channelName : ''));
    channels.forEach(c => c.type = 'search');
    this.scrollPos = 0;
    this.display = channels;
  }

  async loadChannels() {
    console.log("LOADING CHANNELS");
    this.channels = await this.fetch('./channels');
    this.channels = await this.fetch('./channels?count=true');
  }

  async loadUsers() {
    this.users = await this.fetch('./users');
    this.usersById = this.users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    this.users = await this.fetch('./users?count=true');
    this.usersById = this.users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }

  findChannel(id) {
    return this.channels.find(channel => channel.id === id);
  }

  findChannelByName(name) {
    return this.channels.find(channel => channel.name === name);
  }

  findUser(id) {
    return this.usersById[id];
  }

  async selectChannel(channelName) {
    const channel = this.channels.find(channel => channel.name === channelName);
    this.scrollPos = 0;
    this.loadChannel(channel);
  }

  async loadMessage(channelName, {user, ts}) {
    const channel = this.channels.find(channel => channel.name === channelName);
    const { selectedMessage, messages } = await this.fetch('./channels/' + channelName + '?after=true&before=true&user=' + user + '&ts=' + ts);

    this.selectedMessage = selectedMessage;

    channel.type = 'channel';
    channel.messages = messages;
    channel.page = (messages.length / 50) | 0;

    this.scrollPos = 0;
    this.display = [channel];
  }

  async loadChannel(channel, page) {
    if (!channel) return this.display = this.display;

    if (!channel.messages || !page) {

      this.scrollPos = 0;

      const { messages } = await this.fetch('./channels/' + channel.name);
      channel.type = 'channel';
      channel.messages = messages;

    } else if (page === 'next') {

      this.selectedMessage = null;

      const { user, ts } = channel.messages[channel.messages.length-1];

      const { messages } = await this.fetch('./channels/' + channel.name + '?after=true&user=' + user + '&ts=' + ts);
      channel.messages.push(...messages.slice(1));

    } else if (page === 'prev') {

      this.selectedMessage = null;
      this.goToMessage = channel.messages[0];

      const { user, ts } = channel.messages[0];

      const { messages } = await this.fetch('./channels/' + channel.name + '?before=true&user=' + user + '&ts=' + ts);
      channel.messages.unshift(...messages.slice(0,-1));

    } else {
      this.scrollPos = 0;
    }

    this.display = [channel];
  }

  async loadUser(user, page) {
    if (!user) return this.display = this.display;

    if (!user.messages || !page) {
      const messages = await this.fetch('./users/' + user.id);
      user.messages = messages;
      user.page = 1;
      user.type = 'user';
      this.scrollPos = 0;

    } else if (page === 'next') {

      this.selectedMessage = null;
      const { ts } = user.messages[user.messages.length-1];
      const messages = await this.fetch('./users/' + user.id + '?after=true&user=' + user.id + '&ts=' + ts);
      user.messages.push(...messages.slice(1));

    } else if (page === 'prev') {

      this.selectedMessage = null;
      this.goToMessage = user.messages[0];

      const { ts } = user.messages[0];

      const messages = await this.fetch('./users/' + user.id + '?before=true&user=' + user.id + '&ts=' + ts);
      user.messages.unshift(...messages.slice(0,-1));

    }

    this.display = [user];
  }


  isSelected(channel) {
    return this.display && this.display.length === 1 && this.display[0].name === channel.name;
  }

  isSelectedMessage(message) {
    return (
      this.selectedMessage && this.selectedMessage.user === message.user && this.selectedMessage.ts === message.ts
    );
  }

  isGoToMessage(message) {
    const isGoTo = this.goToMessage && this.goToMessage.user === message.user && this.goToMessage.ts === message.ts;
    if (isGoTo) {
      this.goToMessage = null
    }
    return isGoTo;
  }

  hasPrev(channel) {
    if (!channel || !channel.messages || !channel.messages.length || !channel.first) return false;

    const message = channel.messages[0];
    const { first } = channel;

    return first.user !== message.user || first.ts != message.ts;
  }

  hasNext(channel) {
    if (!channel || !channel.messages || !channel.messages.length || !channel.last) return false;

    const message = channel.messages[channel.messages.length-1];
    const { last } = channel;

    return last.user !== message.user || last.ts != message.ts;
  }
}

export default new Store();