import { observable, computed } from 'mobx';

class Store {

  @observable selectedMessage = null;
  @observable searchTerm = '';
  @observable display = null;
  @observable channels = [];
  @observable users = [];
  @observable usersById = {};

  @observable isLoading = false;

  @observable emoji = observable.map({});

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

  @observable loadEmoji(name) {
    if (!this.emoji.has(name)) {
      fetch('/emoji/' + name).then(n => n.text())
        .then(emoji => this.emoji.set(name, emoji));
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

  async search() {
    if (!this.searchTerm) return;
    this.display = await this.fetch('/search/' + this.searchTerm);
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

  async loadChannel(channel) {
    if (!channel.messages) {
      const messages = await this.fetch('./channels/' + channel.name);
      channel.messages = messages;
    }
    this.display = [channel];
  }

  async loadUser(user) {
    // if (!user.messages) {
      const messages = await this.fetch('./users/' + user.id);
      // user.messages = messages;
    // }
    // console.log('GOT MESSAGES', user.messages);
    this.display = [{ name: user.name, messages }];
  }

  isSelected(channel) {
    return this.display && this.display.length === 1 && this.display[0].name === channel.name;
  }

  isSelectedMessage(message) {
    return this.selectedMessage && this.selectedMessage.user === message.user && this.selectedMessage.ts === message.ts;
  }
}

export default new Store();