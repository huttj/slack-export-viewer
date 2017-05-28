import { observable, computed } from 'mobx';

class Store {

  @observable selectedMessage = null;
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

  findUser(id) {
    return this.usersById[id] || {
        name: 'unknown', profile: {
          image_24: 'http://speedsf.com/instructors/default_profile.jpg',
          image_32: 'http://speedsf.com/instructors/default_profile.jpg',
        }
      };
  }

  async selectChannel(channelName) {
    const channel = this.channels.find(channel => channel.name === channelName);
    this.scrollPos = 0;
    this.loadChannel(channel);
  }

  async loadChannel(channel, nextPage) {
    if (!channel) return this.display = this.display;

    console.log(channel);

    if (!channel.messages || !nextPage) {
      const messages = await this.fetch('./channels/' + channel.name);
      channel.type = 'channel';
      channel.messages = messages;
      channel.page = 1;
      this.scrollPos = 0;

    } else if (nextPage) {
      channel.page++;
      const messages = await this.fetch('./channels/' + channel.name + '?page=' + channel.page);
      channel.messages.push(...messages);
    } else {
      this.scrollPos = 0;
    }

    this.display = [channel];
  }

  // async loadUser(user) {
    // if (!user.messages) {
    //   const messages = await this.fetch('./users/' + user.id);
      // user.messages = messages;
    // }
    // console.log('GOT MESSAGES', user.messages);
    // this.display = [{ name: user.name, messages, real_name: user.real_name, count: messages.length }];
  // }

  async loadUser(user, nextPage) {
    if (!user) return this.display = this.display;

    console.log(user);

    if (!user.messages || !nextPage) {
      const messages = await this.fetch('./users/' + user.id);
      user.messages = messages;
      user.page = 1;
      user.type = 'user';
      this.scrollPos = 0;

    } else if (nextPage) {
      user.page++;
      const messages = await this.fetch('./users/' + user.id + '?page=' + user.page);
      user.messages.push(...messages);

    }

    this.display = [user];
  }


  isSelected(channel) {
    return this.display && this.display.length === 1 && this.display[0].name === channel.name;
  }

  isSelectedMessage(message) {
    return this.selectedMessage && this.selectedMessage.user === message.user && this.selectedMessage.ts === message.ts;
  }
}

export default new Store();